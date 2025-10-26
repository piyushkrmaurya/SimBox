import { ToggleControlConfig } from '../../types/controls';
import styles from '../../styles/simulation.module.css';

type ToggleControlProps = {
    config: ToggleControlConfig;
    value: boolean;
    onChange: (value: boolean) => void;
};

export function ToggleControl({ config, value, onChange }: ToggleControlProps) {
    return (
        <div className={styles.toggleGroup}>
            <label className={styles.toggleSwitch}>
                <input
                    type="checkbox"
                    id={config.id}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
            </label>
            <label htmlFor={config.id} className={styles.toggleLabel}>
                {config.label}
            </label>
        </div>
    );
}