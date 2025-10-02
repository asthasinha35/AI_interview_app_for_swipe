import React, { useEffect, useState } from 'react';
import { Tabs, Layout, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import IntervieweeTab from './components/IntervieweeTab.jsx';
import InterviewerTab from './components/InterviewerTab.jsx';
import WelcomeBackModal from './components/WelcomeBackModal.jsx';
import { checkUnfinishedSession } from './store/slices/interviewSlice';

const { Header, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

function App() {
  const dispatch = useDispatch();
  const { activeTab, hasUnfinishedSession } = useSelector(state => state.interview);
  const [currentTab, setCurrentTab] = useState('interviewee');

  useEffect(() => {
    dispatch(checkUnfinishedSession());
  }, [dispatch]);

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Title level={2} style={{ color: 'white', margin: '16px 0', textAlign: 'center' }}>
          AI Interview Assistant
        </Title>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', minHeight: '80vh' }}>
          <Tabs activeKey={currentTab} onChange={handleTabChange} size="large">
            <TabPane tab="Interviewee" key="interviewee">
              <IntervieweeTab />
            </TabPane>
            <TabPane tab="Interviewer Dashboard" key="interviewer">
              <InterviewerTab />
            </TabPane>
          </Tabs>
        </div>
        <WelcomeBackModal />
      </Content>
    </Layout>
  );
}

export default App;