import * as React from 'react';
import '../../ensureOldIEClassName';
import { isShortcutCopy, isShortcutPaste, someKeys } from '../../../lib/events/keyboard/identifiers';
import MouseDrag from '../../../lib/events/MouseDrag';
import { isIE11 } from '../../../lib/utils';
import { Nullable, TimeoutID } from '../../../typings/utility-types';
import { IconType, InputVisibilityState } from '../../Input/Input';
import { InputProps } from '../../Input';
import HiddenInput from './hiddenInput';
import styles from './InputLikeText.module.less';
import { cx } from '../../../lib/theming/Emotion';
import inputStyles from '../../Input/Input.module.less';
import jsInputStyles from '../../Input/Input.styles';
import { ThemeConsumer } from '../../ThemeConsumer';
import { ITheme } from '../../../lib/theming/Theme';
import jsStyles from './InputLikeText.styles';

export interface InputLikeTextProps extends InputProps {
  copyValue: string;
  children?: React.ReactNode;
  innerRef?: (el: HTMLElement | null) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

interface InputLikeTextState extends InputVisibilityState {}

export default class InputLikeText extends React.Component<InputLikeTextProps, InputLikeTextState> {
  public static defaultProps = {
    copyValue: '',
    size: 'small',
  };
  private dragging: boolean = false;
  private selection: any = {
    anchorNode: null,
    anchorOffset: null,
    focusNode: null,
    focusOffset: null,
  };

  public state = {
    blinking: false,
    focused: false,
  };

  private theme!: ITheme;
  private node: HTMLElement | null = null;
  private hiddenInput: HTMLInputElement | null = null;
  private frozen: boolean = false;
  private blinkTimeout: Nullable<TimeoutID>;

  /**
   * @public
   */
  public focus() {
    if (this.node) {
      this.node.focus();
    }
  }

  /**
   * @public
   */
  public blur() {
    if (this.node) {
      this.node.blur();
    }
  }

  /**
   * @public
   */
  public blink() {
    this.setState({ blinking: true }, () => {
      this.blinkTimeout = window.setTimeout(() => this.setState({ blinking: false }), 150);
    });
  }

  public getNode(): HTMLElement | null {
    return this.node;
  }

  public componentWillUnmount() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
  }

  public render() {
    return (
      <ThemeConsumer>
        {theme => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeConsumer>
    );
  }

  private renderMain() {
    const {
      innerRef,
      tabIndex,
      placeholder,
      align,
      borderless,
      width,
      children,
      error,
      warning,
      onChange,
      disabled,
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      copyValue,
      ...rest
    } = this.props;

    const { focused, blinking } = this.state;

    const leftSide = this.renderLeftSide();
    const rightSide = this.renderRightSide();

    const className = cx(inputStyles.root, jsInputStyles.root(this.theme), this.getSizeClassName(), {
      [inputStyles.focus]: focused,
      [inputStyles.warning]: !!warning,
      [inputStyles.error]: !!error,
      [inputStyles.borderless]: !!borderless,
      [inputStyles.disabled]: !!disabled,
      [jsStyles.userSelectContain(this.theme)]: focused,
      [jsStyles.withoutLeftSide(this.theme)]: !leftSide,
      [jsStyles.withoutRightSide(this.theme)]: !rightSide,
      [jsInputStyles.focus(this.theme)]: focused,
      [jsInputStyles.blink(this.theme)]: !!blinking,
      [jsInputStyles.warning(this.theme)]: !!warning,
      [jsInputStyles.error(this.theme)]: !!error,
      [jsInputStyles.disabled(this.theme)]: !!disabled,
    });

    return (
      <span
        {...rest}
        className={className}
        style={{ width, textAlign: align }}
        tabIndex={disabled ? undefined : 0}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        ref={this.ref}
        onKeyDown={this.handleKeyDown}
      >
        <HiddenInput copyValue={copyValue} getNode={this.getHiddenInput} />
        {leftSide}
        <span className={inputStyles.wrapper}>
          <span className={cx(inputStyles.input, styles.input, jsInputStyles.input(this.theme))}>{children}</span>
          {this.renderPlaceholder()}
        </span>
        {rightSide}
      </span>
    );
  }

  private getHiddenInput = (el: HTMLInputElement | null) => {
    this.hiddenInput = el;
  };

  private handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    console.log(
      `InputLikeText - handleKeyDown - ${e.key}`,
      !!(someKeys(isShortcutPaste, isShortcutCopy)(e) && this.hiddenInput),
    );
    if (someKeys(isShortcutPaste, isShortcutCopy)(e) && this.hiddenInput) {
      this.frozen = true;
      setTimeout(() => this.node!.focus(), 0);

      const selectedText: string = getSelection().toString();

      if (isShortcutPaste(e)) {
        // This is super-hack
        this.hiddenInput.focus();
      }
      if (isShortcutCopy(e)) {
        // TODO: надо решить откуда брать значение для копирования... либо перенести код в DateInput...

        if (!isIE11) {
          if (selectedText) {
            this.hiddenInput.value = selectedText;
          }
          this.hiddenInput.select();
          document.execCommand('copy');
        } else {
          const divElement = document.createElement('div');
          divElement.setAttribute('style', 'width:1px;border:0;opacity:0;');
          document.body.appendChild(divElement);
          divElement.innerHTML = selectedText || this.props.copyValue;
          if (!window.getSelection) {
            return;
          }

          const selection = window.getSelection();
          if (selection !== null) {
            try {
              selection.selectAllChildren(divElement);
            } catch (e) {
              // empty block
            }
          }
        }
      }
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
    }
  };

  private ref = (el: HTMLElement | null) => {
    if (el) {
      MouseDrag.listen(el);
      el.removeEventListener('mousedragstart', this.handleMouseDragStart);
      el.removeEventListener('mousedragend', this.handleMouseDragEnd);

      el.addEventListener('mousedragstart', this.handleMouseDragStart);
      el.addEventListener('mousedragend', this.handleMouseDragEnd);
    }
    if (this.props.innerRef) {
      this.props.innerRef(el);
    }
    this.node = el;
  };

  private handleMouseDragStart = () => {
    document.documentElement.classList.add(jsStyles.userSelectNone(this.theme));
    // document.documentElement.style.userSelect = 'none'
  };

  private handleMouseDragEnd = () => {
    document.documentElement.classList.remove(jsStyles.userSelectNone(this.theme));
    // document.documentElement.style.userSelect = 'auto'
  };

  private renderPlaceholder() {
    const { children, placeholder } = this.props;

    if (!children && placeholder) {
      return <span className={cx(inputStyles.placeholder, jsInputStyles.placeholder(this.theme))}>{placeholder}</span>;
    }
    return null;
  }

  private getSizeClassName() {
    switch (this.props.size) {
      case 'large':
        return jsInputStyles.sizeLarge(this.theme);
      case 'medium':
        return jsInputStyles.sizeMedium(this.theme);
      case 'small':
      default:
        return jsInputStyles.sizeSmall(this.theme);
    }
  }

  private handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (this.frozen) {
      this.frozen = false;
      return;
    }

    if (this.props.disabled) {
      return;
    }

    this.setState({ focused: true });

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  private handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (this.frozen) {
      return;
    }
    console.log('InputLikeText - handleBlur', document.activeElement && document.activeElement.tagName);

    this.setState({ focused: false });

    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  private renderLeftIcon(): JSX.Element | null {
    return this.renderIcon(this.props.leftIcon, inputStyles.leftIcon);
  }

  private renderRightIcon(): JSX.Element | null {
    return this.renderIcon(this.props.rightIcon, inputStyles.rightIcon);
  }

  private renderIcon(icon: IconType, className: string): JSX.Element | null {
    if (!icon) {
      return null;
    }

    if (icon instanceof Function) {
      return <span className={className}>{icon()}</span>;
    }

    return (
      <span className={cx(className, inputStyles.useDefaultColor, jsInputStyles.useDefaultColor(this.theme))}>
        {icon}
      </span>
    );
  }

  private renderPrefix(): JSX.Element | null {
    const { prefix } = this.props;

    if (!prefix) {
      return null;
    }

    return <span className={jsInputStyles.prefix(this.theme)}>{prefix}</span>;
  }

  private renderSuffix(): JSX.Element | null {
    const { suffix } = this.props;

    if (!suffix) {
      return null;
    }

    return <span className={jsInputStyles.suffix(this.theme)}>{suffix}</span>;
  }

  private renderLeftSide(): JSX.Element | null {
    const leftIcon = this.renderLeftIcon();
    const prefix = this.renderPrefix();

    if (!leftIcon && !prefix) {
      return null;
    }

    return (
      <span className={inputStyles.sideContainer}>
        {leftIcon}
        {prefix}
      </span>
    );
  }

  private renderRightSide(): JSX.Element | null {
    const rightIcon = this.renderRightIcon();
    const suffix = this.renderSuffix();

    if (!rightIcon && !suffix) {
      return null;
    }

    return (
      <span className={inputStyles.sideContainer}>
        {rightIcon}
        {suffix}
      </span>
    );
  }
}
