import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { Button } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  height: 100%;
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const AgentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const AgentCard = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const NoticeOrError = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledAgentName = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const StyledAgentInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const VoiceAgentsPage = () => {
  const { t } = useLingui();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Architecture reads from standard .env
        // Tomorrow Xavier will inject VITE_VOICE_MODELS_API_URL and VITE_VOICE_MODELS_API_KEY
        const apiUrl = import.meta.env.VITE_VOICE_MODELS_API_URL;
        const apiKey = import.meta.env.VITE_VOICE_MODELS_API_KEY;

        if (!apiUrl || !apiKey) {
          // Fallback placeholders when env vars are missing
          setAgents([
            {
              id: 'agent-1',
              name: 'Sales Agent',
              status: 'Online',
              hostedBy: 'here.now',
            },
            {
              id: 'agent-2',
              name: 'Support Agent',
              status: 'Offline',
              hostedBy: 'here.now',
            },
          ]);
          setError(
            'API endpoint or keys not configured. Showing placeholder data.',
          );
          return;
        }

        const response = await fetch(`${apiUrl}/agents`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agents data');
        }

        const data = await response.json();
        setAgents(data);
      } catch (err: any) {
        setError(err.message || 'Error communicating with voice platform');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <StyledContainer>
      <StyledHeader>
        <div>
          <StyledTitle>{t`Voice Agent Manager`}</StyledTitle>
          <StyledDescription>{t`Deploy, monitor, and manage your AI voice models.`}</StyledDescription>
        </div>
        <Button title={t`Deploy New Agent`} variant="primary" />
      </StyledHeader>

      {error && <NoticeOrError>{error}</NoticeOrError>}

      {loading ? (
        <NoticeOrError>Loading agents...</NoticeOrError>
      ) : (
        <AgentList>
          {agents.map((agent) => (
            <AgentCard key={agent.id}>
              <div>
                <StyledAgentName>{agent.name}</StyledAgentName>
                <StyledAgentInfo>
                  {agent.hostedBy} - {agent.status}
                </StyledAgentInfo>
              </div>
              <Button title={t`Configure`} variant="secondary" />
            </AgentCard>
          ))}
        </AgentList>
      )}
    </StyledContainer>
  );
};
