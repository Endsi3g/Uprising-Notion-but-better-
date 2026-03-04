import styled from '@emotion/styled';

import { MainSettingsLayout } from '~/pages/settings/components/MainSettingsLayout';

const StyledContainer = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export const WebsitePreviewPage = () => {
  return (
    <MainSettingsLayout>
      <StyledContainer>
        <StyledIframe
          src="https://uprisingstudio-mtl.framer.website/#nav-start"
          title="Uprising Studio Website Preview"
        />
      </StyledContainer>
    </MainSettingsLayout>
  );
};

export default WebsitePreviewPage;
