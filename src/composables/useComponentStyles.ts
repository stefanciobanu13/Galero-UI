import { computed } from "vue";

/* ============================================
   COMPONENT STYLES COMPOSABLE
   Centralized styling logic for components
   ============================================ */

/* ========== BUTTON STYLES ========== */

export interface ButtonVariant {
  size?: "small" | "default" | "large";
  variant?: "solid" | "outlined" | "text" | "elevated";
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  disabled?: boolean;
  loading?: boolean;
}

export function useButtonStyles(config: ButtonVariant = {}) {
  const {
    size = "default",
    variant = "solid",
    color = "primary",
    disabled = false,
    loading = false,
  } = config;

  const buttonClasses = computed(() => ({
    [`v-btn--size-${size}`]: true,
    [`v-btn--${variant}`]: true,
    [`v-btn--color-${color}`]: true,
    "v-btn--disabled": disabled,
    "v-btn--loading": loading,
  }));

  return {
    buttonClasses,
  };
}

/* ========== CARD STYLES ========== */

export interface CardVariant {
  elevation?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  outlined?: boolean;
  flat?: boolean;
}

export function useCardStyles(config: CardVariant = {}) {
  const {
    elevation = "md",
    interactive = false,
    outlined = false,
    flat = false,
  } = config;

  const cardClasses = computed(() => ({
    "v-card--interactive": interactive,
    "v-card--outlined": outlined,
    "v-card--flat": flat,
    [`shadow-${elevation}`]: elevation !== "none",
  }));

  return {
    cardClasses,
  };
}

/* ========== CONTAINER/SPACING STYLES ========== */

export interface SpacingConfig {
  padding?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  margin?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function useSpacing(config: SpacingConfig = {}) {
  const { padding = "md", margin = "md", gap = "md" } = config;

  const spacingClasses = computed(() => ({
    [`p-${padding}`]: !!padding,
    [`m-${margin}`]: !!margin,
    [`gap-${gap}`]: !!gap,
  }));

  return {
    spacingClasses,
  };
}

/* ========== FLEX LAYOUT STYLES ========== */

export interface FlexConfig {
  direction?: "row" | "column";
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function useFlexLayout(config: FlexConfig = {}) {
  const {
    direction = "row",
    align = "center",
    justify = "start",
    wrap = false,
    gap = "md",
  } = config;

  const flexClasses = computed(() => ({
    flex: true,
    [`flex-${direction}`]: direction !== "row",
    "flex-wrap": wrap,
    [`gap-${gap}`]: !!gap,
    "items-start": align === "start",
    "items-center": align === "center",
    "items-end": align === "end",
    "justify-start": justify === "start",
    "justify-center": justify === "center",
    "justify-end": justify === "end",
    "justify-between": justify === "between",
    "justify-around": justify === "around",
  }));

  return {
    flexClasses,
  };
}

/* ========== TEXT STYLES ========== */

export interface TextConfig {
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right" | "justify";
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "muted"
    | "white"
    | "black";
  truncate?: boolean;
}

export function useTextStyles(config: TextConfig = {}) {
  const {
    size = "base",
    weight = "normal",
    align = "left",
    color = "primary",
    truncate = false,
  } = config;

  const textClasses = computed(() => ({
    [`text-${size}`]: true,
    [`text-${weight}`]: weight !== "normal",
    [`text-${align}`]: align !== "left",
    [`text-${color}`]: color !== "primary",
    truncate: truncate,
  }));

  return {
    textClasses,
  };
}

/* ========== BORDER & RADIUS STYLES ========== */

export interface BorderConfig {
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  border?: boolean;
  borderColor?:
    | "primary"
    | "secondary"
    | "border"
    | "border-light"
    | "border-dark";
  sides?: "all" | "top" | "bottom" | "left" | "right";
}

export function useBorderStyles(config: BorderConfig = {}) {
  const {
    radius = "md",
    border = false,
    borderColor = "border",
    sides = "all",
  } = config;

  const borderClasses = computed(() => ({
    [`rounded-${radius}`]: radius !== "none",
    border: border && sides === "all",
    [`border-${sides}`]: border && sides !== "all",
    [`border-${borderColor}`]: border,
  }));

  return {
    borderClasses,
  };
}

/* ========== SHADOW & ELEVATION STYLES ========== */

export interface ShadowConfig {
  elevation?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  hover?: boolean;
  interactive?: boolean;
}

export function useShadowStyles(config: ShadowConfig = {}) {
  const { elevation = "md", hover = false, interactive = false } = config;

  const shadowClasses = computed(() => ({
    [`shadow-${elevation}`]: elevation !== "none",
    "hover:shadow-lg": hover,
    "cursor-pointer transition-all": interactive,
  }));

  return {
    shadowClasses,
  };
}

/* ========== ALERT/STATUS STYLES ========== */

export type AlertType = "success" | "warning" | "error" | "info";

export interface AlertConfig {
  type: AlertType;
  variant?: "solid" | "outlined" | "tonal";
  dismissible?: boolean;
}

export function useAlertStyles(config: AlertConfig) {
  const { type, variant = "tonal", dismissible = true } = config;

  const alertClasses = computed(() => ({
    [`v-alert--type-${type}`]: true,
    [`v-alert--${variant}`]: variant !== "solid",
    "v-alert--dismissible": dismissible,
  }));

  const colorMap: Record<AlertType, string> = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    info: "var(--color-info)",
  };

  return {
    alertClasses,
    alertColor: colorMap[type],
  };
}

/* ========== RESPONSIVE STYLES ========== */

export interface ResponsiveConfig {
  hideOnMobile?: boolean;
  showOnMobile?: boolean;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function useResponsiveStyles(config: ResponsiveConfig = {}) {
  const { hideOnMobile = false, showOnMobile = false, cols = {} } = config;

  const responsiveClasses = computed(() => ({
    "sm:hidden": hideOnMobile,
    "sm:block": showOnMobile,
    [`cols-${cols.xs}`]: !!cols.xs,
    [`sm:cols-${cols.sm}`]: !!cols.sm,
    [`md:cols-${cols.md}`]: !!cols.md,
  }));

  return {
    responsiveClasses,
  };
}

/* ========== ANIMATION/TRANSITION STYLES ========== */

export type TransitionSpeed = "fast" | "base" | "slow";

export interface AnimationConfig {
  transition?: TransitionSpeed;
  type?: "all" | "colors" | "opacity" | "transform";
  hover?: boolean;
}

export function useAnimationStyles(config: AnimationConfig = {}) {
  const { transition = "base", type = "all", hover = false } = config;

  const animationClasses = computed(() => ({
    [`transition-${transition}`]: true,
    [`transition-${type}`]: type !== "all",
    "hover:opacity-80": hover && type === "opacity",
    "hover:scale-105": hover && type === "transform",
  }));

  return {
    animationClasses,
  };
}

/* ========== COMBINED COMPONENT STYLES ========== */

export interface FormFieldConfig {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  size?: "small" | "default" | "large";
}

export function useFormFieldStyles(config: FormFieldConfig = {}) {
  const {
    label,
    required = false,
    error = false,
    disabled = false,
    size = "default",
  } = config;

  const fieldClasses = computed(() => ({
    [`v-field--size-${size}`]: size !== "default",
    "v-field--error": error,
    "v-field--disabled": disabled,
  }));

  return {
    fieldClasses,
    showRequired: required,
    showError: error,
  };
}

/* ========== THEME COLOR TOKENS ========== */

export const colorTokens = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
  info: "var(--color-info)",
  white: "var(--color-white)",
  black: "var(--color-black)",
};

export const spacingTokens = {
  xs: "var(--spacing-xs)",
  sm: "var(--spacing-sm)",
  md: "var(--spacing-md)",
  lg: "var(--spacing-lg)",
  xl: "var(--spacing-xl)",
  "2xl": "var(--spacing-2xl)",
};

export const shadowTokens = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
};

export const radiusTokens = {
  sm: "var(--border-radius-sm)",
  md: "var(--border-radius-md)",
  lg: "var(--border-radius-lg)",
  xl: "var(--border-radius-xl)",
  full: "var(--border-radius-full)",
};
