import * as awsui from '@cloudscape-design/design-tokens';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface CustomScrollbarProps {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
  onScroll: (newScrollTop: number) => void;
  disabled?: boolean;
}

export default function CustomScrollbar({
  scrollHeight,
  clientHeight,
  scrollTop,
  onScroll,
  disabled,
}: CustomScrollbarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ initialScroll: 0, initialY: 0 });

  // Drag-to-scroll logic
  useEffect(() => {
    const maxScroll = scrollHeight - clientHeight;

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      const { initialScroll, initialY } = dragStartRef.current;
      const deltaY = event.clientY - initialY;

      // Convert mouse delta to scroll delta
      const scrollbarTrackHeight = clientHeight;
      const thumbHeight = Math.max(
        20,
        (clientHeight / scrollHeight) * scrollbarTrackHeight,
      );
      const maxThumbTravel = scrollbarTrackHeight - thumbHeight;

      if (maxThumbTravel <= 0) return;

      const scrollDelta = (deltaY / maxThumbTravel) * maxScroll;
      const newScroll = initialScroll + scrollDelta;
      onScroll(Math.max(0, Math.min(newScroll, maxScroll)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scrollHeight, clientHeight, onScroll]);

  if (scrollHeight <= clientHeight) {
    return null; // Don't render if not needed
  }

  // Scrollbar calculations
  const thumbHeight = Math.max(
    20, // Min height
    (clientHeight / scrollHeight) * clientHeight,
  );

  // Protect against out-of-range scrollTop (including negative) and zero division.
  const scrollRange = Math.max(1, scrollHeight - clientHeight);
  const rawThumbTop = (scrollTop / scrollRange) * (clientHeight - thumbHeight);
  const thumbTop = Math.max(
    0,
    Math.min(rawThumbTop, clientHeight - thumbHeight),
  );

  return (
    <ScrollbarTrack style={{ height: `${clientHeight}px` }}>
      <ScrollbarThumb
        style={{
          height: `${thumbHeight}px`,
          top: `${thumbTop}px`,
        }}
        onMouseDown={(e) => {
          if (disabled) return;
          setIsDragging(true);
          dragStartRef.current = {
            initialScroll: scrollTop,
            initialY: e.clientY,
          };
          e.preventDefault();
        }}
      />
    </ScrollbarTrack>
  );
}

const ScrollbarTrack = styled.div`
  width: 12px;
  background-color: ${awsui.colorBackgroundHomeHeader};
  border: 1px solid ${awsui.colorBorderDividerDefault};
  border-left: none;
  border-radius: 0 ${awsui.borderRadiusContainer} ${awsui.borderRadiusContainer} 0;
  position: relative;
`;

const ScrollbarThumb = styled.div`
  width: 100%;
  background-color: ${awsui.colorTextButtonNormalDisabled};
  border-radius: 6px;
  position: absolute;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    background-color: ${awsui.colorTextBodyDefault};
  }
`;
