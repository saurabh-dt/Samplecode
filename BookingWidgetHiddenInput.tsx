import React from "react";
import { useMediaQuery } from "react-responsive";

import Portal from "components/ui/Portal";
import { breakpointsMax } from "styles/variables";

const Container = ({ formId, children }: { formId: string; children: React.ReactElement }) => {
  const isMobile = useMediaQuery({ maxWidth: breakpointsMax.large });
  return !isMobile ? (
    children
  ) : (
    <Portal id={formId} automaticRemovalOnUnmount={false}>
      {children}
    </Portal>
  );
};

const BookingWidgetHiddenInput = ({
  name,
  value,
  formId = "booking-widget-form",
}: {
  name: string;
  value: string;
  formId?: string;
}) => (
  <Container formId={formId}>
    <input type="hidden" name={name} value={value} />
  </Container>
);

export default BookingWidgetHiddenInput;
