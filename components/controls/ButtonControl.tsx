import { ButtonControlConfig } from '../../types/controls';
import styles from '../../styles/simulation.module.css';

type ButtonControlProps = {
    config: ButtonControlConfig;
    onClick: () => void;
    disabled?: boolean;
};

export function ButtonControl({ config, onClick, disabled }: ButtonControlProps) {
    const label = disabled && config.disabledLabel ? config.disabledLabel : config.label;

    return (
        <div className={styles.buttonGroup}>
            <button onClick={onClick} disabled={disabled} className={styles.button}>
                {label}
            </button>
        </div>
    );
}

