import * as React from 'react';

interface Props {
  copyValue?: string;
  getNode: (ref: HTMLInputElement | null) => void;
}

const cap: React.FocusEventHandler = e => e.stopPropagation();

class HiddenInput extends React.Component<Props> {
  public render() {
    const { copyValue = '', getNode } = this.props;
      return (
        <input
          ref={getNode}
          type="text"
          tabIndex={-1}
          value={copyValue}
          onBlur={cap}
          onFocus={cap}
          style={{
            position: 'absolute',
            width: 1,
            height: 0,
            border: 0,
            outline: 0,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            opacity: 0,
          }}
        />
      );
  }
}

export default HiddenInput;
