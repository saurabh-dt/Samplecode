import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/core";

import BookingWidgetLoadingTopBanner from "./BookingWidgetHeader/BookingWidgetLoadingTopBanner";
import { initialOffset, stickyOffset } from "./BookingWidgetDesktopWrapper";
import useBWScroll from "./useBWScroll";

import MediaQuery from "components/ui/MediaQuery";
import { DisplayType } from "types/enums";
import { column, skeletonPulse } from "styles/base";
import { typographySubtitle1 } from "styles/typography";
import { whiteColor, boxShadowTop, gutters, boxShadowStrong, borderRadius } from "styles/variables";

const StyledMediaQuery = styled(MediaQuery)(column({ small: 0, large: 3 / 8, desktop: 1 / 3 }));

const LoadingFooterWrapper = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${boxShadowTop};
  width: 100%;
  height: 80px;
  padding: 10px;
  background-color: ${whiteColor};
  /* stylelint-disable-next-line selector-max-type */
  button {
    ${typographySubtitle1};
  }
`;

export const StickyContainer = styled.div`
  position: sticky;
  top: ${stickyOffset}px;
  z-index: 0;
  box-shadow: ${boxShadowStrong};
  height: 100vh;
  overflow: hidden;
`;

const Wrapper = styled.div<{ ontop?: boolean; distancetotop: number }>(
  ({ ontop, distancetotop }) => css`
    position: relative;
    box-shadow: ${boxShadowStrong};
    border-radius: ${borderRadius};
    height: calc(
      100vh - ${ontop ? `${stickyOffset}px` : `${Math.abs(initialOffset - distancetotop)}px`}
    );
  `
);

const LoadingButton = styled.div([
  skeletonPulse,
  css`
    border-radius: 4px;
    width: 100%;
    max-height: 50px;
  `,
]);

export const DropdownLoading = styled.div([
  skeletonPulse,
  css`
    margin: ${gutters.small}px 0;
    width: 100%;
    height: 48px;
  `,
]);

export const DropdownLoadingLabel = styled.div([
  skeletonPulse,
  css`
    width: 100%;
    height: 16px;
  `,
]);

export const LoadingSectionLabel = styled.div([
  skeletonPulse,
  css`
    width: 100px;
    height: 16px;
  `,
]);

export const LoadingSectionContentWrapper = styled.div(
  () => css`
    padding: ${gutters.small}px;
  `
);

export const LoadingSectionContent = styled.div([
  skeletonPulse,
  css`
    height: 160px;
  `,
]);

const BookingWidgetLoadingContainer = () => {
  const { bookingWidgetRef, elDistanceToTop, hasReachedHeader } = useBWScroll();
  return (
    <StyledMediaQuery fromDisplay={DisplayType.Medium}>
      <StickyContainer>
        <Wrapper ref={bookingWidgetRef} ontop={hasReachedHeader} distancetotop={elDistanceToTop}>
          <BookingWidgetLoadingTopBanner />
          <LoadingFooterWrapper>
            <LoadingButton />
          </LoadingFooterWrapper>
        </Wrapper>
      </StickyContainer>
    </StyledMediaQuery>
  );
};

export default BookingWidgetLoadingContainer;
