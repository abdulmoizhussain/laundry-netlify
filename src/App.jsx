import { useEffect, useState } from 'react';
import "./App.css";

function App() {
  const [_textArea, setTextArea] = useState("");
  const [_keysOnly, setKeysOnly] = useState([]);
  const [_allClothesAndCount, setAllClothesAndCount] = useState([]);
  const [_individualDetails, setIndividualDetails] = useState([]);
  const [_totalObject, setTotalObject] = useState({
    totalAmountToPay: 0,
    totalClothes: 0,
    totalRows: 0,
  });

  useEffect(() => {
    const typeAndRates = localStorage.getItem("ClotheTypeAndRates");
    const typeAndRatesArray = JSON.parse(typeAndRates);
    if (typeAndRatesArray && Array.isArray(typeAndRatesArray)) {
      setKeysOnly(typeAndRatesArray);
    }
  }, []);

  function onConfirmRates(ev) {
    const splitText = _textArea.split("\n");

    const allClothesAndCount = [];
    splitText.forEach(val => {
      const result = /^([0-9]+)x\s(.+)$/.exec(val);
      if (result) {
        const count = result[1];
        const clotheType = result[2];
        const obj = { clotheType, count, rowTotal: 0 };
        allClothesAndCount.push(obj);
      }
    });
    console.log("total rows at the time of parsing:", allClothesAndCount.length);

    const keysOnly = [..._keysOnly];
    new Set(allClothesAndCount.map(x => x.clotheType).sort()).forEach((value, index) => {
      const key = `key-${index}`;
      const obj = {
        key,
        clotheType: value,
        rate: "",
      };

      if (!keysOnly.find(x => x.clotheType === value)) {
        keysOnly.push(obj);
      }
    });

    setAllClothesAndCount(allClothesAndCount);
    keysOnly.length !== _keysOnly.length && setKeysOnly(keysOnly);
  }

  function handleRateChange(ev, index) {
    _keysOnly[index].rate = ev.target.value;
    const newState = [..._keysOnly];
    setKeysOnly(newState);

    localStorage.setItem("ClotheTypeAndRates", JSON.stringify(newState));
  }

  function onCalculateTotal(ev) {
    console.log("total rows at the time of total:", _allClothesAndCount.length);
    const allClothesAndCount = [..._allClothesAndCount];
    let totalPayable = 0;
    let totalClothes = 0;
    let totalRows = 0;

    const individualDetails = [];

    for (const singleRow of allClothesAndCount) {
      const keyOnly = _keysOnly.find(x => x.clotheType === singleRow.clotheType);
      if (keyOnly) {
        const clothesInThisRow = parseFloat(singleRow.count);
        const rate = parseFloat(keyOnly.rate);
        const amountOfSingleRow = clothesInThisRow * rate;
        singleRow.rate = rate;
        singleRow.thisRowAmount = amountOfSingleRow;

        totalClothes += clothesInThisRow;
        totalPayable += amountOfSingleRow;
        totalRows++;

        let indDetail = individualDetails.find(x => x.clotheType === singleRow.clotheType);
        if (indDetail) {
          indDetail.count += clothesInThisRow;
          indDetail.thisRowAmount += amountOfSingleRow;
        } else {
          indDetail = {
            clotheType: singleRow.clotheType,
            rate: rate,
            count: clothesInThisRow,
            thisRowAmount: amountOfSingleRow,
          };
          individualDetails.push(indDetail);
        }
      }
    }

    setTotalObject({
      totalAmountToPay: totalPayable,
      totalClothes: totalClothes,
      totalRows: totalRows,
    });
    setIndividualDetails(individualDetails.map(x => `${x.clotheType} [${x.count}x${x.rate}]->${x.thisRowAmount}`));
  }

  return (
    <>
      <div>
        <textarea rows={30} cols={100} onChange={x => setTextArea(x.target.value)} value={_textArea} />
        <br />
        <button onClick={onConfirmRates}>Confirm Rates</button>
        <br />
        <br />
        {_keysOnly.map((val, index) => {
          return <div key={val.key}>
            <label htmlFor={val.key}>{val.clotheType}</label> <input id={val.key} type='number' value={val.rate} onChange={ev => handleRateChange(ev, index)} /> rs
          </div>;
        })}
        {_keysOnly.length && <button onClick={onCalculateTotal}>Calculate Total</button>}
        {_keysOnly.length && <div>
          <b>{"Total Payment->"} {_totalObject.totalAmountToPay}</b> <br />
          {"Total rows->"} {_totalObject.totalRows} <br />
          {"Total clothes->"} {_totalObject.totalClothes} <br />
          {_individualDetails.length && <>
            <br />{"Details->"}<br />
            {_individualDetails.map((val, index) => <div key={index}>{val}</div>)}
          </>}

        </div>}

      </div>
    </>
  );
}

export default App;
