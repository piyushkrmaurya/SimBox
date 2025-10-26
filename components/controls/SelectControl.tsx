import { SelectControlConfig } from '@/types/controls';
import styles from '@/styles/simulation.module.css';

type SelectControlProps = {
    config: SelectControlConfig;
    value: string;
    onChange: (value: string) => void;
};

export function SelectControl({ config, value, onChange }: SelectControlProps) {
    return (
        <div className={styles.selectGroup}>
            <label htmlFor={config.id}>{config.label}</label>
            <select
                id={config.id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={styles.select}
            >
                {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}