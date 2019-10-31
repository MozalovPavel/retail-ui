import { css } from '../../../lib/theming/Emotion';
import { ITheme } from '../../../lib/theming/Theme';

const jsStyles = {
  userSelectContain(t: ITheme) {
    return css`
      user-select: text;
      -ms-user-select: element;
    `;
  },

  userSelectNone(t: ITheme) {
    return css`
      user-select: none;
    `;
  },

  withoutLeftSide(t: ITheme) {
    return css`
      padding-left: 10px;
    `;
  },

  withoutRightSide(t: ITheme) {
    return css`
      padding-right: 10px;
    `;
  },
};

export default jsStyles;
