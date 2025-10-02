export const parseResume = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        let text = '';

        if (file.type === 'application/pdf') {
          // For PDF files, we'll use a simple text extraction approach
          text = await extractTextFromPDF(arrayBuffer);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // For DOCX files, use mammoth
          text = await extractTextFromDOCX(arrayBuffer);
        } else {
          text = `File: ${file.name}`;
        }

        const extractedInfo = extractInfoFromText(text);
        resolve(extractedInfo);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Simple PDF text extraction without external dependencies
const extractTextFromPDF = async (arrayBuffer) => {
  try {
    // Convert array buffer to string for basic text extraction
    // This is a simplified approach - in production you'd want a proper PDF parser
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(uint8Array);
    
    // Basic cleaning - remove non-printable characters but keep spaces and line breaks
    text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    text = text.replace(/\s+/g, ' ');
    
    return text;
  } catch (error) {
    console.warn('Basic PDF extraction failed:', error);
    return 'PDF file uploaded. Manual information entry required.';
  }
};

// DOCX text extraction
const extractTextFromDOCX = async (arrayBuffer) => {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.warn('DOCX parsing failed:', error);
    return 'DOCX file uploaded. Manual information entry required.';
  }
};

const extractInfoFromText = (text) => {
  const info = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    resumeText: text
  };

  console.log('Extracted info:', info); // Debug log
  return info;
};

const extractName = (text) => {
  // Common name patterns in resumes
  const namePatterns = [
    // Patterns for "Name: John Doe"
    /(?:^|\n)\s*name\s*[:\-]\s*([^\n\r]+)/i,
    /(?:^|\n)\s*full[\s-]*name\s*[:\-]\s*([^\n\r]+)/i,
    /(?:^|\n)\s*contact[\s-]*name\s*[:\-]\s*([^\n\r]+)/i,
    
    // Patterns for header-style names (usually first line)
    /^(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?=\s*$)/m,
    
    // Email-based name extraction (john.doe@email.com -> John Doe)
    /([a-z]+)(?:[._-]([a-z]+))?@/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      let name = match[1] || match[0];
      
      // Clean up the extracted name
      name = name.trim()
        .replace(/^\W+|\W+$/g, '') // Remove surrounding punctuation
        .replace(/\s+/g, ' ')      // Normalize spaces
        .split('\n')[0]            // Take only first line
        .trim();
      
      // Validate it looks like a real name
      if (isValidName(name)) {
        // Capitalize name properly
        name = name.split(' ').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        
        return name;
      }
    }
  }

  return '';
};

const extractEmail = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  
  if (emails) {
    // Return the first valid email, prefer personal emails over generic ones
    const personalEmail = emails.find(email => 
      !email.includes('noreply') && 
      !email.includes('no-reply') &&
      !email.includes('example.com')
    );
    return personalEmail || emails[0];
  }
  
  return '';
};

const extractPhone = (text) => {
  // Comprehensive phone number patterns
  const phonePatterns = [
    // International format: +1 (555) 123-4567
    /\+\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g,
    
    // US format: (555) 123-4567
    /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g,
    
    // With extensions: 555-123-4567 x123
    /\d{3}[\s-]?\d{3}[\s-]?\d{4}[\s\w]*x?[\s\w]*\d+/gi,
    
    // Simple 10-digit: 5551234567
    /\b\d{10}\b/g,
    
    // Phone: pattern
    /(?:phone|mobile|tel|telephone)[\s:]*([^\n\r]+)/gi
  ];

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Clean and format the phone number
      const phone = matches[0].replace(/[^\d+]/g, '');
      
      // Basic validation
      if (phone.length >= 10) {
        return formatPhoneNumber(phone);
      }
    }
  }

  return '';
};

// Helper function to validate names
const isValidName = (name) => {
  if (!name || name.length < 2 || name.length > 50) return false;
  
  // Should contain at least one space (first + last name)
  if (!name.includes(' ')) return false;
  
  // Should not contain numbers or special characters except hyphens and apostrophes
  if (/[0-9]/.test(name.replace(/[-']/g, ''))) return false;
  
  // Should have proper capitalization pattern
  const words = name.split(' ');
  return words.every(word => word.length > 0 && /^[A-Z]/.test(word));
};

// Helper function to format phone numbers
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // US format: (555) 123-4567
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  // International format: +1 (555) 123-4567
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  // International with country code: +44 20 1234 5678
  if (cleaned.startsWith('+') && cleaned.length > 10) {
    return cleaned;
  }
  
  return cleaned;
};