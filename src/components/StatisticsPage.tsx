import React from 'react';
import { useTimer } from '../context/TimerContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatisticsPage: React.FC = () => {
  const { emotionalRatings } = useTimer();

  // Format the data for the chart
  const chartData = emotionalRatings.map(rating => ({
    time: new Date(rating.timestamp).toLocaleTimeString(),
    rating: rating.rating
  }));

  // Calculate the average emotional reactivity
  const averageRating = emotionalRatings.length > 0
    ? emotionalRatings.reduce((acc, curr) => acc + curr.rating, 0) / emotionalRatings.length
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Emotional Reactivity Statistics</h2>

      {emotionalRatings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No emotional reactivity data available yet. Enable tracking and complete a trading session to see statistics here.
        </p>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Session Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold">{emotionalRatings.length}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Reactivity</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Reading</p>
                <p className="text-2xl font-bold">
                  {emotionalRatings.length > 0 ? emotionalRatings[emotionalRatings.length - 1].rating : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Reactivity Over Time</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Detailed Entries</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reactivity Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {emotionalRatings.map((rating, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(rating.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {rating.rating}/10
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage; 