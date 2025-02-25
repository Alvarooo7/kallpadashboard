// MenuBar.js
import { Link } from 'react-router-dom';

const MenuBar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/transactions-report">Dashboard Transacciones</Link>
                </li>
                <li>
                    <Link to="/balance-report">Reporte Balance</Link>
                </li>
            </ul>
        </nav>
    );
};

export default MenuBar;
