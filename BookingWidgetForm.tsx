import React from "react";
import styled from "@emotion/styled";

import { gutters } from "styles/variables";
import { mqMin } from "styles/base";

const BWForm = styled.form`
  flex-grow: 1;
  ${mqMin.large} {
    margin: 0 ${gutters.large / 2}px;
  }
`;

const BookingWidgetForm = ({
  children,
  id,
  method,
  action,
  onSubmit,
}: {
  children: React.ReactNode;
  id: string;
  method?: string;
  action?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined;
}) => {
  return (
    <BWForm id={id} action={action} method={method} onSubmit={onSubmit}>
      {children}
    </BWForm>
  );
};

export default BookingWidgetForm;
