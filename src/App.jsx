import React, { useState, useEffect } from 'react';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseFormattedNumber = (formattedNumber) => {
  return parseFloat(formattedNumber.replace(/,/g, '')) || 0;
};

const RetirementPlanner = () => {
  const [currentAssets, setCurrentAssets] = useState(localStorage.getItem('currentAssets') || '');
  const [yearsTillRetirement, setYearsTillRetirement] = useState(localStorage.getItem('yearsTillRetirement') || '');
  const [estimatedReturn, setEstimatedReturn] = useState(localStorage.getItem('estimatedReturn') || '');
  const [compoundingFrequency, setCompoundingFrequency] = useState('yearly');
  const [results, setResults] = useState([]);

  useEffect(() => {
    localStorage.setItem('currentAssets', currentAssets);
    localStorage.setItem('yearsTillRetirement', yearsTillRetirement);
    localStorage.setItem('estimatedReturn', estimatedReturn);
    localStorage.setItem('compoundingFrequency', compoundingFrequency);

    calculateRetirementPlan();
  }, [currentAssets, yearsTillRetirement, estimatedReturn, compoundingFrequency]);

  const calculateRetirementPlan = () => {
    let currentTotal = parseFormattedNumber(currentAssets);
    const returnRate = parseFloat(estimatedReturn) / 100;
    const compoundingFactor = compoundingFrequency === 'yearly' ? 1 : 12; // Adjust the compounding factor based on frequency

    const newResults = Array.from({ length: parseInt(yearsTillRetirement) * compoundingFactor }, (_, index) => {
      const yearlyReturn = currentTotal * returnRate;
      const monthlyReturn = yearlyReturn / 12;

      currentTotal = currentTotal + (compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn);

      return {
        period: index + 1,
        total: formatNumberWithCommas(currentTotal.toFixed(2)),
        compoundingAmount: formatNumberWithCommas((compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn).toFixed(2)),
      };
    });

    setResults(newResults);
  };

  const handleReset = () => {
    setCurrentAssets('');
    setYearsTillRetirement('');
    setEstimatedReturn('');
    setCompoundingFrequency('yearly');
  };

  return (
    <div>
      
      <h1>Savings Planner</h1>

      <div className='inputs'>
      <div>
        <label>Current Assets:</label>
        <input type="text" value={`$${currentAssets}`} onChange={(e) => setCurrentAssets(e.target.value.replace('$', ''))} />
      </div>
      <div>
        <label>Years to save:</label>
        <input type="text" value={yearsTillRetirement} onChange={(e) => setYearsTillRetirement(e.target.value)} />
      </div>
      <div>
        <label>Estimated Return (%):</label>
        <input type="text" value={estimatedReturn} onChange={(e) => setEstimatedReturn(e.target.value)} />
      </div>
      <div>
        <label>Compounding Frequency:</label>
        <select value={compoundingFrequency} onChange={(e) => setCompoundingFrequency(e.target.value)}>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div>
        <button onClick={handleReset}>Reset</button>
      </div>
      </div>

      <div>
        <h2 className='results-heading'>Results</h2>
        <div className='results-header'>
          <div class="year">Period</div>
          <div>Compounding Amount</div>
          <div>End Total</div>
        </div>
          <div class="results">
          {results.map((result) => (
              <div class="card" key={result.period}>
                <div class="period">{result.period}</div>
                <div><span className='dollar-sign'>$</span>{result.compoundingAmount}</div>
                <div><span className='dollar-sign'>$</span>{result.total}</div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default RetirementPlanner;
