import React from "react";
import styled from "@emotion/styled";
import rgba from "polished/lib/color/rgba";
import { css } from "@emotion/core";

import ErrorBoundary from "../ErrorBoundary";

import { Trans } from "i18n";
import { redColor, gutters, boxShadowTop, whiteColor } from "styles/variables";
import { column } from "styles/base";
import MediaQuery from "components/ui/MediaQuery";
import { DisplayType } from "types/enums";
import { typographySubtitle1 } from "styles/typography";
import { Namespaces } from "shared/namespaces";

const DesktopWrapper = styled.div([
  css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${gutters.small}px;
    background-color: ${rgba(redColor, 0.1)};
    text-align: center;
  `,
]);

const ErrorTitle = styled.div([
  typographySubtitle1,
  css`
    color: ${rgba(redColor, 0.8)};
  `,
]);

const ErrorText = styled.div`
  margin-top: ${gutters.small / 2}px;
  color: ${rgba(redColor, 0.8)};
`;

const MobileWrapper = styled.div`
  padding: ${gutters.small}px;
  background-color: ${rgba(redColor, 0.1)};
`;

const DesktopMediaQuery = styled(MediaQuery)([
  column({ small: 0, large: 3 / 8, desktop: 1 / 3 }),
  css`
    height: 100%;
  `,
]);

const MobileMediaQuery = styled(MediaQuery)`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  box-shadow: ${boxShadowTop};
  width: 100%;
  background-color: ${whiteColor};
`;

const RefreshLink = styled.a(
  ({ theme }) => css`
    color: ${rgba(theme.colors.primary, 0.7)};
    text-decoration: underline;
  `
);

export const RefreshPageLink = () => (
  <RefreshLink href={window.location.href}>
    <Trans>Click here to refresh the page and try again</Trans>
  </RefreshLink>
);

const errorContent = (
  <>
    <ErrorTitle>
      <Trans>Whoops!</Trans>
    </ErrorTitle>
    <ErrorText>
      <Trans ns={Namespaces.commonBookingWidgetNs}>
        We are terribly sorry. It seems our booking widget is not working at the moment.
      </Trans>
      <RefreshPageLink />
    </ErrorText>
  </>
);

const ErrorComponent = () => (
  <>
    <DesktopMediaQuery fromDisplay={DisplayType.Large}>
      <DesktopWrapper>{errorContent}</DesktopWrapper>
    </DesktopMediaQuery>
    <MobileMediaQuery toDisplay={DisplayType.Large}>
      <MobileWrapper>{errorContent}</MobileWrapper>
    </MobileMediaQuery>
  </>
);

const BookingWidgetErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary ErrorComponent={ErrorComponent}>{children}</ErrorBoundary>
);

export default BookingWidgetErrorBoundary;
