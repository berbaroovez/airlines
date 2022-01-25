import React from "react";

import "./App.css";
import { yearsList, airportsList, statOptionsList } from "./utils/data";
import { Report, TableInfo } from "./types";
import { useEffect, useState } from "react";

// interface FlightInfo {
//   label: string;
//   data: {
//     year: number;
//     airport: string;
//     months: {
//       month: string;
//       count: number;
//     }[];
//   };
// }

function App() {
  const [rawData, setRawData] = useState<Report[]>([]);
  const [tableData, setTableData] = useState<TableInfo[]>();
  const [statOption, setStatOption] = useState<string>(
    statOptionsList[0].shortForm
  );
  const [airportList, setAirportList] = useState<string[]>([
    airportsList[0].code,
  ]);
  const [year, setYear] = useState<number>(yearsList[0]);

  useEffect(() => {
    const fetchData = async () => {
      const data: Report[] = await fetch(
        "https://flare-code-exercise-data.s3.amazonaws.com/airlines.json"
      ).then((res) => res.json());

      setRawData(data);
    };
    fetchData();
  }, []);

  const getFlightsInformation = () => {
    const dataObject: TableInfo[] = [];
    //we need to fill the array with nulls because we are not looping through months 0-11 we just grab the month number from the data for indexing the array
    //when filling it

    airportList.forEach((airportCode) => {
      dataObject.push({
        code: airportCode,
        data: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        length: 0,
      });
    });

    rawData.forEach((item) => {
      airportList.forEach((code, index) => {
        if (item.Airport.Code == code) {
          if (item.Time.Year == year) {
            dataObject[index].length++;
            //change this its currently hardcoded for only one option
            //hook it up to a switch statement
            dataObject[index].data[item.Time.Month - 1] = Math.floor(
              (item.Statistics.Flights["On Time"] /
                item.Statistics.Flights.Total) *
                100
            );
          }
        }
      });
    });

    //loop through each airport and get the mean for the year
    dataObject.forEach((item) => {
      if (item.data.length > 0) {
        const addAllNumbers = item.data.reduce(reducer);
        if (addAllNumbers) {
          item.data[12] = Math.floor(addAllNumbers / item.length);
        }
      }
    });

    return dataObject;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = getFlightsInformation();
    setTableData(data);
  };
  //reducer function to add all the numbers in an array
  const reducer = (
    previousValue: null | number,
    currentValue: null | number
  ) => {
    if (previousValue === null) {
      return currentValue;
    }
    if (currentValue === null) {
      return previousValue;
    }
    return previousValue + currentValue;
  };

  return (
    <div className="App">
      <div className="header">
        <h1>
          <div>Airport Data Viewer</div>
        </h1>
        <p>
          Please select a type of data, a year, and which airports you want to
          see data for. Multiple airports can be selected.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        Show{" "}
        <select
          id="statType"
          value={statOption}
          onChange={(e) => {
            setStatOption(e.target.value);
          }}
        >
          {statOptionsList.map((item) => (
            <option key={item.shortForm} value={item.shortForm}>
              {item.longForm}
            </option>
          ))}
        </select>{" "}
        for{" "}
        <select
          id="year"
          value={year}
          onChange={(e) => {
            setYear(parseInt(e.target.value));
          }}
        >
          {yearsList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>{" "}
        at{" "}
        <select
          id="airport"
          onChange={(e) => {
            let value = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );

            setAirportList(value);
          }}
          value={airportList}
          multiple
        >
          {airportsList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code}
            </option>
          ))}
        </select>
        <button type="submit">Calculate</button>
      </form>

      {statOption && statOption}
      {year && year}
      {airportList && airportList}
      <div className="table">
        {tableData && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Jan</th>
                <th>Feb</th>
                <th>Mar</th>
                <th>Apr</th>
                <th>May</th>
                <th>Jun</th>
                <th>Jul</th>
                <th>Aug</th>
                <th>Sep</th>
                <th>Oct</th>
                <th>Nov</th>
                <th>Dec</th>
                <th>Mean</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.code}</td>
                  {item.data.map((dataPoint, index) => {
                    console.log(`${index} - ${dataPoint}`);
                    console.log(item.data.length);

                    if (dataPoint === 0) {
                      return <td key={index}>0{statOption != "NoF" && "%"}</td>;
                    } else if (dataPoint != null) {
                      return (
                        <td key={index}>
                          {dataPoint}
                          {statOption != "NoF" && "%"}
                        </td>
                      );
                    } else {
                      return <td key={index}>-</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="footer">
        <p>Airport Data Viewer</p>
        <p>Carter Olson</p>

        <p>{new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default App;
