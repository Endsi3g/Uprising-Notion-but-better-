import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  height: 100%;
  width: 100%;
`;

const StyledTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 24px;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const AppCard = styled.a`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  background-color: ${({ theme }) => theme.background.secondary};
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const AppInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const AppTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const AppSubtitle = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 13px;
`;

export const AppHubPage = () => {
  const { t } = useLingui();

  const {
    records: apps,
    loading,
    error,
  } = useFindManyRecords({
    objectNameSingular: 'appHubLink',
    filter: {},
  });

  const displayApps =
    apps && apps.length > 0
      ? apps
      : [
          {
            id: 'default1',
            title: 'Google Workspace',
            desc: 'Email and Calendar',
            link: 'https://workspace.google.com',
          },
          {
            id: 'default2',
            title: 'Notion',
            desc: 'Documentation & Notes',
            link: 'https://notion.so',
          },
          {
            id: 'default3',
            title: 'Slack',
            desc: 'Team Communication',
            link: 'https://slack.com',
          },
          {
            id: 'default4',
            title: 'GitHub',
            desc: 'Code Repositories & CI/CD',
            link: 'https://github.com',
          },
          {
            id: 'default5',
            title: 'Google Drive',
            desc: 'File Storage & Sharing',
            link: 'https://drive.google.com',
          },
          {
            id: 'default6',
            title: 'Google Meet',
            desc: 'Video Conferences',
            link: 'https://meet.google.com',
          },
          {
            id: 'default7',
            title: 'Google Docs',
            desc: 'Word Processing',
            link: 'https://docs.google.com',
          },
        ];

  return (
    <StyledContainer>
      <StyledTitle>{t`Agency App Hub`}</StyledTitle>
      <StyledDescription>{t`Access all of your embedded agency applications from a single dashboard.`}</StyledDescription>

      {loading ? (
        <StyledDescription>{t`Loading apps...`}</StyledDescription>
      ) : error && (!apps || apps.length === 0) ? (
        // Ignore error if it's just 'Object appHubLink not found' because they might not have created the Custom Object yet
        <StyledDescription>{t`Please create a Custom Object named 'AppHubLink' with fields 'title', 'desc', and 'link' to manage these apps.`}</StyledDescription>
      ) : (
        <AppGrid>
          {displayApps.map((app: any) => (
            <AppCard
              key={app.id || app.title}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <AppInfo>
                <AppTitle>{app.title}</AppTitle>
                <AppSubtitle>{app.desc}</AppSubtitle>
              </AppInfo>
            </AppCard>
          ))}
        </AppGrid>
      )}
    </StyledContainer>
  );
};
