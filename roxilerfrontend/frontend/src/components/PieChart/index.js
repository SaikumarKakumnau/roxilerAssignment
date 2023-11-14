import { PieChart, Pie, Cell, Legend } from "recharts";

import "./index.css";

const PieChartComponent = (props) => {
  const { pieChartData, selectMonth } = props;
//   console.log(pieChartData);
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate an array of random colors based on the number of data points
  const colors = pieChartData.pieChartData.map(() => getRandomColor());
  return (
    <div className="piechart-container">
      <h1>
        Pie Chart Stats (Category) -{" "}
        {selectMonth.displayText === "Select Month" ? "Overall" : selectMonth.displayText}
      </h1>
      <PieChart width={1000} height={400}>
        <Pie
          data={pieChartData.pieChartData}
          cx="50%"
          cy="30%"
          outerRadius="60%"
          dataKey="count"
          nameKey="category"
          label
        >
          {pieChartData.pieChartData.map((eachCell, index) => (
            <Cell name={eachCell.category} fill={colors[index]} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ fontSize: 16, fontFamily: "Roboto" }}
        />
      </PieChart>
    </div>
  );
};

export default PieChartComponent;