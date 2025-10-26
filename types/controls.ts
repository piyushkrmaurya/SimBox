export type RangeControlConfig = {
    type: 'range';
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
    defaultValue: number;
    displayValue?: (value: number) => string;
    disabled?: boolean;
};

export type ToggleControlConfig = {
    type: 'toggle';
    id: string;
    label: string;
    defaultValue: boolean;
    disabled?: boolean;
};

export type SelectControlConfig = {
    type: 'select';
    id: string;
    label: string;
    options: { value: string; label: string }[];
    defaultValue: string;
    disabled?: boolean;
};

export type ButtonControlConfig = {
    type: 'button';
    id: string;
    label: string;
    disabled?: boolean;
    disabledLabel?: string;
    defaultValue?: undefined;
};

export type ControlConfig = RangeControlConfig | SelectControlConfig | ToggleControlConfig | ButtonControlConfig;

export type ControlValue = number | boolean | string | undefined;

export type ControlsConfig = {
    [key: string]: ControlConfig;
};