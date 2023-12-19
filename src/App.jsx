import React, { useState, useEffect, useRef } from 'react';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseFormattedNumber = (formattedNumber) => {
  return parseFloat(formattedNumber.replace(/,/g, '')) || 0;
};

// Add this ref in your render function
const chartRef = useRef(null);

const updateChart = () => {
  const ctx = chartRef.current.getContext('2d');

  const labels = results.map(result => result.period);
  const data = results.map(result => parseFormattedNumber(result.total));

  if (window.myBarChart) {
    window.myBarChart.destroy();
  }

  window.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Year',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total',
          },
        },
      },
    },
  });
};


const RetirementPlanner = () => {
  const [currentAssets, setCurrentAssets] = useState(localStorage.getItem('currentAssets') || '');
  const [yearsTillRetirement, setYearsTillRetirement] = useState(localStorage.getItem('yearsTillRetirement') || '');
  const [estimatedReturn, setEstimatedReturn] = useState(localStorage.getItem('estimatedReturn') || '');
  const [contributionAmount, setContributionAmount] = useState(localStorage.getItem('contributionAmount') || '');
  const [compoundingFrequency, setCompoundingFrequency] = useState('yearly');
  const [results, setResults] = useState([]);
  const [showInputs, setShowInputs] = useState(true);
  const [enteredValues, setEnteredValues] = useState({
    currentAssets: '',
    yearsTillRetirement: '',
    estimatedReturn: '',
    contributionAmount: '',
    compoundingFrequency: 'yearly',
  });

  useEffect(() => {
    setEnteredValues({
      currentAssets,
      yearsTillRetirement,
      estimatedReturn,
      contributionAmount,
      compoundingFrequency,
    });

    localStorage.setItem('currentAssets', currentAssets);
    localStorage.setItem('yearsTillRetirement', yearsTillRetirement);
    localStorage.setItem('estimatedReturn', estimatedReturn);
    localStorage.setItem('contributionAmount', contributionAmount);
    localStorage.setItem('compoundingFrequency', compoundingFrequency);
  
    calculateRetirementPlan();
    updateChart(); // Call the updateChart function
  }, [currentAssets, yearsTillRetirement, estimatedReturn, contributionAmount, compoundingFrequency, results]);

  const calculateRetirementPlan = () => {
  let currentTotal = parseFormattedNumber(currentAssets);
  const returnRate = parseFloat(estimatedReturn) / 100;
  const compoundingFactor = compoundingFrequency === 'yearly' ? 1 : 12;
  const contribution = parseFormattedNumber(contributionAmount);

  const newResults = Array.from({ length: parseInt(yearsTillRetirement) * compoundingFactor }, (_, index) => {
    const yearlyReturn = currentTotal * returnRate;
    const monthlyReturn = yearlyReturn / 12;

    const startingAmount = currentTotal;

    currentTotal = currentTotal + (compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn);

    const totalWithContribution = currentTotal + contribution;

    return {
      period: index + 1,
      startingAmount: formatNumberWithCommas(startingAmount.toFixed(2)),
      compoundingAmount: formatNumberWithCommas((compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn).toFixed(2)),
      contributionAmount: formatNumberWithCommas(contribution.toFixed(2)),
      total: formatNumberWithCommas(totalWithContribution.toFixed(2)),
    };
  });

  setResults(newResults);
};

  const handleReset = () => {
    setCurrentAssets('');
    setYearsTillRetirement('');
    setEstimatedReturn('');
    setContributionAmount('');
    setCompoundingFrequency('yearly');
  };

  const toggleInputs = () => {
    setShowInputs(!showInputs);
  };

  const getTotal = (property) => {
    return results.reduce((total, result) => total + parseFloat(result[property].replace(/,/g, '')), 0).toFixed(2);
  };

  // Calculate final balance and compound interest accrued separately
  const finalBalance = getTotal('total');
  const compoundInterestAccrued = finalBalance - getTotal('startingAmount');


  return (
    <div>
      <h1>Savings Planner</h1>

      <div className='input-container'>
        <div>
          <button onClick={toggleInputs}>{showInputs ? 'Hide Inputs' : 'Show Inputs'}</button>
        </div>

        {(showInputs || !enteredValues) && (
          <div className='inputs'>

            
            <div>
              <label>Current Assets:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={`$${currentAssets}`}
                onChange={(e) => setCurrentAssets(e.target.value.replace('$', ''))}
              />
            </div>
            <div>
              <label>Years to save:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={yearsTillRetirement}
                onChange={(e) => setYearsTillRetirement(e.target.value)}
              />
            </div>
            <div>
              <label>Estimated Return (%):</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={estimatedReturn}
                onChange={(e) => setEstimatedReturn(e.target.value)}
              />
            </div>
            <div>
              <label>Contribution Amount:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={`$${contributionAmount}`}
                onChange={(e) => setContributionAmount(e.target.value.replace('$', ''))}
              />
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
        )}

        <div className='display-values' style={{ display: showInputs ? 'none' : 'flex' }}>
          <p><strong>Current Assets:</strong> {`$${currentAssets}`}</p>
          <p><strong>Period:</strong> {yearsTillRetirement}</p>
          <p><strong>Est. Return (%):</strong> {estimatedReturn}</p>
          <p><strong>Contribution:</strong> {`$${contributionAmount}`}</p>
          <p><strong>Frequency:</strong> {compoundingFrequency}</p>
        </div>
      </div>

      <div>
        <h2 className='results-heading'>Results</h2>
        <div className='results-header'>
          <div class="year">Period</div>
          <div>Starting</div>
          <div>Compounding</div>
          <div>Contributions</div>
          <div>End Total</div>
        </div>
        <div class="results">
          {results.map((result) => (
            <div class="card" key={result.period}>
              <div class="year">{result.period}</div>
              <div><span className='dollar-sign'>$</span>{result.startingAmount}</div>
              <div><span className='dollar-sign'>$</span>{result.compoundingAmount}</div>
              <div><span className='dollar-sign'>$</span>{result.contributionAmount}</div>
              <div><span className='dollar-sign'>$</span>{result.total}</div>
            </div>
          ))}
        </div>

        <div className='totals-section'>
          <h2>Totals</h2>
          <p><strong>Final Balance:</strong> ${finalBalance}</p>
          <p><strong>Interest Accrued:</strong> ${compoundInterestAccrued}</p>
          <p><strong>Total Contributions:</strong> ${getTotal('contributionAmount')}</p>
          <p><strong>Return:</strong> {(((finalBalance - getTotal('startingAmount')) / getTotal('startingAmount')) * 100).toFixed(2)}%</p>
        </div>

        <canvas ref={chartRef}></canvas>

      </div>
    </div>
  );
};

export default RetirementPlanner;
