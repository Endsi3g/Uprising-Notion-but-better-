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

const StyledAppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledAppCard = styled.a`
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

const StyledAppInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledAppTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const StyledAppSubtitle = styled.span`
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
            title: t`Google Workspace`,
            desc: t`Email and Calendar`,
            link: 'https://workspace.google.com',
          },
          {
            id: 'default2',
            title: t`Notion`,
            desc: t`Documentation & Notes`,
            link: 'https://notion.so',
          },
          {
            id: 'default3',
            title: t`Slack`,
            desc: t`Team Communication`,
            link: 'https://slack.com',
          },
          {
            id: 'default4',
            title: t`GitHub Repositories`,
            desc: t`Manage your code and deployments`,
            link: 'https://github.com/uprising-studio',
          },
          {
            id: 'default5',
            title: t`Google Drive`,
            desc: t`File Storage & Sharing`,
            link: 'https://drive.google.com',
          },
          {
            id: 'default6',
            title: t`Google Meet`,
            desc: t`Video Conferences`,
            link: 'https://meet.google.com',
          },
          {
            id: 'default7',
            title: t`Google Docs`,
            desc: t`Word Processing`,
            link: 'https://docs.google.com',
          },
        ];

  return (
    <StyledContainer>
      <StyledTitle>{t`Uprising App Hub`}</StyledTitle>
      <StyledDescription>{t`Accédez à tous vos outils d'agence et dépôts GitHub depuis un point central.`}</StyledDescription>

      {loading ? (
        <StyledDescription>{t`Loading apps...`}</StyledDescription>
      ) : error && (!apps || apps.length === 0) ? (
        // Ignore error if it's just 'Object appHubLink not found' because they might not have created the Custom Object yet
        <StyledDescription>{t`Please create a Custom Object named 'AppHubLink' with fields 'title', 'desc', and 'link' to manage these apps.`}</StyledDescription>
      ) : (
        <StyledAppGrid>
          {displayApps.map((app: any) => (
            <StyledAppCard
              key={app.id || app.title}
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StyledAppInfo>
                <StyledAppTitle>{app.title}</StyledAppTitle>
                <StyledAppSubtitle>{app.desc}</StyledAppSubtitle>
              </StyledAppInfo>
            </StyledAppCard>
          ))}
        </StyledAppGrid>
      )}
    </StyledContainer>
  );
};
