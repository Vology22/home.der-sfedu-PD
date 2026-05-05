import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../contexts/FilterContext';
import { Button, Icon } from '../../components/ui';
import { RxCross2, RxCheck} from "react-icons/rx";
import styles from './Filter.module.scss';

const Filter = () => {
  const { setFilters, resetFilters, filters} = useFilters();
  const navigate = useNavigate();
  
  const [minCount, setMinCount] = useState<string>(filters.minCount?.toString() || '');
  const [maxCount, setMaxCount] = useState<string>(filters.maxCount?.toString() || '');
  const [minSquare, setMinSquare] = useState<string>(filters.minSquare?.toString() || '');
  const [maxSquare, setMaxSquare] = useState<string>(filters.maxSquare?.toString() || '');
  const [city, setCity] = useState<string>(filters.city || '');

  const handleApplyFilters = () => {
    const newFilters = {
      minCount: minCount ? Number(minCount) : undefined,
      maxCount: maxCount ? Number(maxCount) : undefined,
      minSquare: minSquare ? Number(minSquare) : undefined,
      maxSquare: maxSquare ? Number(maxSquare) : undefined,
      city: city || undefined,
    };
    
    setFilters(newFilters);
    navigate('/'); // Возвращаемся на страницу с квартирами
  };

  const handleReset = () => {
    setMinCount('');
    setMaxCount('');
    setMinSquare('');
    setMaxSquare('');
    setCity('');
    resetFilters();
  };

  return (
    <div className={styles.filterPage}>    
      <div className={styles.filtersCard}>
        <label className={styles.filtersCard_label} >Количество комнат </label>
        <div className={styles.rangeInputs}>
          <input type="number" placeholder="От" value={minCount} onChange={(e) => setMinCount(e.target.value)}/>
          <span>—</span>
          <input type="number" placeholder="До" value={maxCount} onChange={(e) => setMaxCount(e.target.value)}/>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <label className={styles.filtersCard_label} >Площадь (м²)</label>
        <div className={styles.rangeInputs}>
          <input type="number" placeholder="От" value={minSquare} onChange={(e) => setMinSquare(e.target.value)}/>
          <span>—</span>
          <input type="number" placeholder="До" value={maxSquare} onChange={(e) => setMaxSquare(e.target.value)}/>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <label className={styles.filtersCard_label}>Город</label>
        <input type="text" placeholder="Например: Москва" className={styles.inputField} value={city} onChange={(e) => setCity(e.target.value)}/>
      </div>

      <div className={styles.buttons}>
        <Button onClickAdditional={handleApplyFilters}> <Icon Icon = {RxCheck}/>Применить фильтры</Button>
        <Button onClickAdditional={handleReset}> <Icon Icon={RxCross2} /> Сбросить</Button>
      </div>
    </div>
  );
};

export default Filter;