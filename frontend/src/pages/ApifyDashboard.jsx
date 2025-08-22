import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #00ffaa;
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #e0e0e0;
  font-size: 1.1rem;
  opacity: 0.8;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ActorCard = styled.div`
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #00ffaa;
    box-shadow: 0 10px 30px rgba(0, 255, 170, 0.2);
  }
`;

const ActorName = styled.h3`
  color: #00ffaa;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const ActorDescription = styled.p`
  color: #e0e0e0;
  margin-bottom: 1rem;
  opacity: 0.9;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ActorStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const Stat = styled.span`
  color: #00ccff;
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #00ffaa, #00ccff);
  border: none;
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 170, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingCard = styled.div`
  background: rgba(15, 15, 35, 0.8);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #00ccff;
  grid-column: 1 / -1;
`;

const RunsSection = styled.div`
  margin-top: 3rem;
`;

const RunCard = styled.div`
  background: rgba(15, 15, 35, 0.6);
  border: 1px solid rgba(0, 204, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RunInfo = styled.div`
  color: #e0e0e0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background: ${props => {
    switch (props.status) {
      case 'SUCCEEDED': return 'linear-gradient(135deg, #00ffaa, #00cc88)';
      case 'RUNNING': return 'linear-gradient(135deg, #00ccff, #0088cc)';
      case 'FAILED': return 'linear-gradient(135deg, #ff4757, #ff3742)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => props.status === 'FAILED' ? '#fff' : '#000'};
`;

const ApifyDashboard = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [runningActors, setRunningActors] = useState(new Set());

  useEffect(() => {
    fetchFeaturedActors();
  }, []);

  const fetchFeaturedActors = async () => {
    try {
      const response = await fetch('/api/apify/featured');
      const data = await response.json();
      
      if (data.success) {
        setActors(data.actors);
      } else {
        toast.error('Error fetching Apify actors');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect to Apify');
    } finally {
      setLoading(false);
    }
  };

  const runActor = async (actorId, actorName) => {
    setRunningActors(prev => new Set([...prev, actorId]));
    
    try {
      const response = await fetch(`/api/apify/run/${actorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Basic configuration - can be customized per actor
          maxPages: 1,
          maxResults: 10
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${actorName} started successfully!`);
        
        // Add to runs list
        setRuns(prev => [{
          id: data.runId,
          actorName,
          status: data.status,
          startedAt: new Date().toISOString()
        }, ...prev]);
        
        // Start polling for status
        pollRunStatus(data.runId, actorName);
      } else {
        toast.error('Failed to start actor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error starting actor');
    } finally {
      setRunningActors(prev => {
        const newSet = new Set(prev);
        newSet.delete(actorId);
        return newSet;
      });
    }
  };

  const pollRunStatus = async (runId, actorName) => {
    try {
      const response = await fetch(`/api/apify/runs/${runId}`);
      const data = await response.json();
      
      if (data.success) {
        setRuns(prev => prev.map(run => 
          run.id === runId 
            ? { ...run, status: data.status, finishedAt: data.finishedAt, results: data.results }
            : run
        ));
        
        if (data.status === 'RUNNING') {
          setTimeout(() => pollRunStatus(runId, actorName), 5000);
        } else if (data.status === 'SUCCEEDED') {
          toast.success(`${actorName} completed successfully!`);
        } else if (data.status === 'FAILED') {
          toast.error(`${actorName} failed to complete`);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const formatActorName = (name) => {
    return name.replace(/^apify\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Container>
        <LoadingCard>
          <h3>🔄 Loading Apify Actors...</h3>
          <p>Connecting to Apify platform...</p>
        </LoadingCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🕷️ Apify Web Scraping</Title>
        <Subtitle>
          Powerful web scraping tools to extract data from websites, social media, and search engines.
        </Subtitle>
      </Header>

      <Grid>
        {actors.map((actor) => (
          <ActorCard key={actor.id}>
            <ActorName>{formatActorName(actor.name)}</ActorName>
            <ActorDescription>
              {actor.description || 'Professional web scraping tool for data extraction.'}
            </ActorDescription>
            <ActorStats>
              <Stat>⭐ {actor.stats?.totalRuns || 0} runs</Stat>
              <Stat>👤 {actor.username}</Stat>
            </ActorStats>
            <RunButton
              onClick={() => runActor(actor.id, formatActorName(actor.name))}
              disabled={runningActors.has(actor.id)}
            >
              {runningActors.has(actor.id) ? '🔄 Starting...' : '🚀 Run Actor'}
            </RunButton>
          </ActorCard>
        ))}
      </Grid>

      {runs.length > 0 && (
        <RunsSection>
          <Title style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Runs</Title>
          {runs.map((run) => (
            <RunCard key={run.id}>
              <RunInfo>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{run.actorName}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Started: {new Date(run.startedAt).toLocaleString()}
                </div>
                {run.results && (
                  <div style={{ fontSize: '0.8rem', color: '#00ffaa' }}>
                    ✅ {Array.isArray(run.results) ? run.results.length : 'Results'} items extracted
                  </div>
                )}
              </RunInfo>
              <StatusBadge status={run.status}>{run.status}</StatusBadge>
            </RunCard>
          ))}
        </RunsSection>
      )}
    </Container>
  );
};

export default ApifyDashboard;