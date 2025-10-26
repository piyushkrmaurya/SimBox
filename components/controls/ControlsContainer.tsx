import { ControlsConfig, ControlValue } from '../../types/controls';
import { RangeControl } from './RangeControl';
import { SelectControl } from './SelectControl';
import { ToggleControl } from './ToggleControl';
import { ButtonControl } from './ButtonControl';
import styles from '../../styles/simulation.module.css';

type ControlsContainerProps = {
    config: ControlsConfig;
    values: { [key: string]: ControlValue };
    onChange: (key: string, value: ControlValue) => void;
    columns?: number;
    onAction?: (key: string) => void;
};

export function ControlsContainer({ config, values, onChange, onAction, columns = 1 }: ControlsContainerProps) {
    return (
        <div
            className={styles.controlsContainer}
            style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
        >
            {Object.entries(config).map(([key, controlConfig]) => {
                switch (controlConfig.type) {
                    case 'range':
                        return (
                            <RangeControl
                                key={key}
                                config={controlConfig}
                                value={values[key] as number}
                                onChange={(v) => onChange(key, v)}
                            />
                        );
                    case 'select':
                        return (
                            <SelectControl
                                key={key}
                                config={controlConfig}
                                value={values[key] as string}
                                onChange={(v) => onChange(key, v)}
                            />
                        );
                    case 'toggle':
                        return (
                            <ToggleControl
                                key={key}
                                config={controlConfig}
                                value={values[key] as boolean}
                                onChange={(v) => onChange(key, v)}
                            />
                        );
                    case 'button':
                        return (
                            <ButtonControl
                                key={key}
                                config={controlConfig}
                                onClick={() => onAction?.(key)}
                                disabled={controlConfig.disabled}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}