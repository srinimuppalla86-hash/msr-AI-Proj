import React, { useState, useCallback } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import WizardSteps from './components/WizardSteps';
import StepSetup from './components/StepSetup';
import StepFetchIssues from './components/StepFetchIssues';
import StepReview from './components/StepReview';
import StepTestPlan from './components/StepTestPlan';
import HistoryModal from './components/HistoryModal';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Shared state across wizard steps
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [fetchedIssues, setFetchedIssues] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    productName: '',
    projectKey: '',
    sprintVersion: '',
    additionalContext: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmApiKey, setLlmApiKey] = useState('');

  const handleConnectionSelect = useCallback((connection) => {
    setSelectedConnection(connection);
  }, []);

  const handleContinueToFetch = useCallback(() => {
    if (selectedConnection) {
      if (!completedSteps.includes(0)) {
        setCompletedSteps(prev => [...prev, 0]);
      }
      setCurrentStep(1);
    }
  }, [selectedConnection, completedSteps]);

  const handleIssuesFetched = useCallback((issues, details) => {
    setFetchedIssues(issues);
    setSelectedIssues(issues);
    setProjectDetails(details);
    if (!completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
    }
    setCurrentStep(2);
  }, [completedSteps]);

  const handleTestPlanGenerated = useCallback((plan) => {
    setGeneratedPlan(plan);
    if (!completedSteps.includes(2)) {
      setCompletedSteps(prev => [...prev, 2]);
    }
    setCurrentStep(3);
  }, [completedSteps]);

  const handleStepClick = useCallback((step) => {
    // Allow navigating to completed steps or the current next step
    if (step <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(step);
    }
  }, [completedSteps]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepSetup
            selectedConnection={selectedConnection}
            onConnectionSelect={handleConnectionSelect}
            onContinue={handleContinueToFetch}
            llmProvider={llmProvider}
            setLlmProvider={setLlmProvider}
            llmApiKey={llmApiKey}
            setLlmApiKey={setLlmApiKey}
          />
        );
      case 1:
        return (
          <StepFetchIssues
            connection={selectedConnection}
            onIssuesFetched={handleIssuesFetched}
            onChangeConnection={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <StepReview
            connection={selectedConnection}
            issues={fetchedIssues}
            selectedIssues={selectedIssues}
            setSelectedIssues={setSelectedIssues}
            projectDetails={projectDetails}
            setProjectDetails={setProjectDetails}
            llmProvider={llmProvider}
            llmApiKey={llmApiKey}
            onGenerateTestPlan={handleTestPlanGenerated}
            onRefreshIssues={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepTestPlan plan={generatedPlan} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage="test-planner" />

      <div className="main-content">
        <AppHeader onViewHistory={() => setShowHistory(true)} />
        <WizardSteps
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        <div className="page-content">
          {renderStep()}
        </div>
      </div>

      {showHistory && (
        <HistoryModal onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default App;
