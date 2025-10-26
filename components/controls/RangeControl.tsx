import { RangeControlConfig } from '../../types/controls';
import styles from '../../styles/simulation.module.css';

type RangeControlProps = {
    config: RangeControlConfig;
    value: number;
    onChange: (value: number) => void;
};

export function RangeControl({ config, value, onChange }: RangeControlProps) {
    return (
        <div className={styles.sliderGroup}>
            <label htmlFor={config.id}>
                {config.label}: {config.displayValue ? config.displayValue(value) : `${value}${config.unit || ''}`}
            </label>
            <input
                type="range"
                id={config.id}
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}