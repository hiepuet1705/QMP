import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Navbar from "../bar/Navbar";
import { Outlet, Link } from "react-router-dom";
import "./styles.css";
import AuthContext from "../variable/AuthContext";
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Sidebar from "../bar/Sidebar";
import axios from "axios";

export const Dashboard = () => {
  const monthLimit = 5;
  const token = localStorage.getItem("token");
  const { role } = useContext(AuthContext);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (loading && Object.keys(data).length === 0) {
        console.log("token: ", token);
        try {
          const response = await axios.get(
            "http://127.0.0.1:3000/manager/statistic",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setData(response.data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };

    fetchData();
  }, [loading, data]);

  useEffect(() => {
    if (Object.keys(data).length > 0 && loading) {
      setLoading(false);

      const chartData = {
        options: {
          labels: ["Chờ Giao Hàng", "Giao Thành Công", "Hàng Hủy"],
          colors: ["#008FFB", "#00E396", "#FEB019"],
          chart: {
            width: 250,
            type: "donut",
          },
        },
        series: [0, 0, 0],
      };

      for (const item of data.packageStatistic) {
        if (item._id === "success") {
          chartData.series[1] += item.count;
        } else if (item._id === "failed") {
          chartData.series[2] += item.count;
        } else if (item._id === "shipping" || item._id === "pending") {
          chartData.series[0] += item.count;
        }
      }

      const incomeTmp = (data.monthlyIncome || []).map((item) => item.total);
      const categoTmp = (data.monthlyIncome || []).map(
        (item) => item._id.month + "/" + item._id.year
      );

      const lineChartData = {
        options: {
          xaxis: {
            categories: categoTmp,
          },
        },
        series: [
          {
            name: "Doanh Thu",
            data: incomeTmp,
          },
        ],
      };

      setData((prevData) => ({
        ...prevData,
        chartData,
        lineChartData,
      }));
    }
  }, [data, loading]);

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="content-container">
        <Sidebar />

        <div className="content">
          <h1>Hệ Thống Chuyển Phát</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <div className="dashboard-summary">
                <div className="overview">
                  <h2>Tổng Quan</h2>
                  <p>Số Lượng Đơn Hàng: {data.totalTransactions}</p>
                  <p>Số Lượng Điểm Giao Dịch: {data.totalDeliveryPoints}</p>
                  <p>Số Lượng Điểm Tập Kết: {data.totalCenters}</p>
                </div>
                <div className="income">
                  <h2>Doanh Thu</h2>
                  {data.monthlyIncome && data.monthlyIncome.length > 1 ? (
                    <>
                      <p>
                        Doanh Thu Tháng Này:{" "}
                        {
                          data.monthlyIncome[data.monthlyIncome.length - 1]
                            .total
                        }{" "}
                        VNĐ
                      </p>
                      <p>
                        Doanh Thu Tháng Trước:{" "}
                        {
                          data.monthlyIncome[data.monthlyIncome.length - 2]
                            .total
                        }{" "}
                        VNĐ
                      </p>
                      <p>
                        Tăng Trưởng:{" "}
                        {(
                          ((data.monthlyIncome[data.monthlyIncome.length - 1]
                            .total -
                            data.monthlyIncome[data.monthlyIncome.length - 2]
                              .total) /
                            data.monthlyIncome[data.monthlyIncome.length - 2]
                              .total) *
                          100
                        ).toFixed(2)}{" "}
                        %
                      </p>
                    </>
                  ) : (
                    <p>Chưa có dữ liệu doanh thu đủ để tính toán</p>
                  )}
                </div>
              </div>

              <div className="charts-container">
                <div className="chart-container">
                  <h3>Số lượng hàng</h3>
                  {data.chartData ? (
                    <Chart
                      options={data.chartData.options}
                      series={data.chartData.series}
                      type="donut"
                    />
                  ) : (
                    <p>Chưa có dữ liệu biểu đồ</p>
                  )}
                </div>

                <div className="line-chart-container">
                  <h3>Doanh Thu</h3>
                  {data.lineChartData ? (
                    <Chart
                      options={data.lineChartData.options}
                      series={data.lineChartData.series}
                      type="line"
                      height={350}
                    />
                  ) : (
                    <p>Chưa có dữ liệu biểu đồ</p>
                  )}
                </div>
              </div>
              <div className="map-container-wrapper">
                <h3>Bản Đồ Điểm Giao Dịch</h3>
                <iframe
                  src="https://www.google.com/maps/d/u/0/embed?mid=1uf1wNufrV1rqpJX-VyUMqWjwqKOivNs&ehbc=2E312F&noprof=1"
                  width="100%"
                  height={480}
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
