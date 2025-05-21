import React, { ReactNode } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/core";

import { ArrowIcon, DisplayValue, DropdownContainer } from "../Inputs/ContentDropdown";

import { StyledContentDropdown } from "./BookingWidgetDropdown";

import { useIsTabletStrict } from "hooks/useMediaQueryCustom";
import RadioSelectionDropdown, {
  DisplayWrapper,
} from "components/ui/Inputs/RadioSelectionDropdown";
import { fontWeightRegular, guttersPx, gutters } from "styles/variables";
import { mqMax, mqMin } from "styles/base";
import {
  NoBackgroundDisplay,
  DisplayWrapper as FlightFareDisplayWrapper,
} from "components/ui/FlightSearchWidget/FlightFareCategoryContainer";

export const StyledRadioSelectionDropdown = styled(RadioSelectionDropdown)<{
  shouldDisplayArrowIcon: boolean;
  arrowIconDirection: "down" | "up";
}>(
  ({ theme, shouldDisplayArrowIcon, arrowIconDirection }) => css`
    margin-top: 0;
    ${mqMin.large} {
      padding: 0;
    }
    ${DropdownContainer} {
      top: 20px;
      max-height: 200px;
      overflow: auto;
      border-color: ${theme.colors.primary};
    }

    ${ArrowIcon} {
      margin-left: ${gutters.large / 4}px;
      width: 12px;
      height: 12px;
      transform: ${arrowIconDirection === "down" ? "rotate(90deg)" : "rotate(-90deg)"};
      fill: ${theme.colors.primary};
    }

    ${DisplayWrapper} {
      margin-top: 0;
      margin-left: ${guttersPx.small};
      height: auto;
      cursor: ${shouldDisplayArrowIcon ? "pointer" : "default"};
      color: ${theme.colors.primary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ${DisplayValue} {
      height: auto;
    }
    ${StyledContentDropdown} {
      border: none;
    }
  `
);

export const BookingWidgetExtra = ({
  id,
  selectedOptionId,
  selectedOptionTitle,
  options,
  onChange,
  onClick,
  directionOverflow = "left",
  shouldDisplayArrowIcon = true,
  className,
  arrowIconDirection = "down",
}: {
  id: string;
  selectedOptionId?: string;
  selectedOptionTitle?: string;
  options: SharedTypes.AutocompleteItem[];
  onChange: (selectedItemId: string) => void;
  onClick?: () => void;
  directionOverflow?: "right" | "left";
  shouldDisplayArrowIcon?: boolean;
  className?: string;
  arrowIconDirection?: "down" | "up";
}) => {
  const selectedValue = options.find(type => type.id === selectedOptionId) ?? {
    id: "",
    name: "",
  };
  const isTabletStrict = useIsTabletStrict();

  return (
    <StyledRadioSelectionDropdown
      id={id}
      selectedValue={
        selectedOptionTitle ? { ...selectedValue, name: selectedOptionTitle } : selectedValue
      }
      options={options}
      onChange={onChange}
      onClick={onClick}
      directionOverflow={directionOverflow}
      shouldDisplayArrowIcon={shouldDisplayArrowIcon}
      shouldDisplayTitle={isTabletStrict}
      arrowIconDirection={arrowIconDirection}
      className={className}
    />
  );
};

const ExtrasContainer = styled.div<{ itemsCount: number }>(({ itemsCount }) => [
  css`
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    margin-top: ${guttersPx.smallHalf};
    padding: 0 ${guttersPx.large};

    ${mqMax.large} {
      display: flex;
      align-items: flex-end;
      margin-top: 0;
      padding: 0;
    }

    ${StyledRadioSelectionDropdown} {
      ${DisplayValue} {
        margin-top: 0;
      }
    }

    ${DisplayValue} {
      ${ArrowIcon} {
        margin-left: ${gutters.small / 4}px;
        width: 8px;
        height: 8px;
      }
    }

    ${FlightFareDisplayWrapper}, ${NoBackgroundDisplay}, ${DisplayWrapper} {
      font-weight: ${fontWeightRegular};
    }
  `,
  // set max-width for each element to allow ellipsis to take effect
  itemsCount > 1 &&
    css`
      & > div {
        max-width: ${100 / itemsCount + 10}%;
      }
    `,
]);

export const BookingWidgetExtrasRow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <ExtrasContainer itemsCount={React.Children.count(children)} className={className}>
    {children}
  </ExtrasContainer>
);
