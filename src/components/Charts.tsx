import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'primereact/chart';

interface ChartProps {
    labels: string[];
    datasets: {
        type: 'bar' | 'line';
        label: string;
        data: number[];
        color?: string;
        fillColor?: string;
    }[];
}

const Charts: React.FC<ChartProps> = ({ labels, datasets }) => {
    const chartRef = useRef<any>(null);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#333';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#ddd';

        // Prepare datasets
        const preparedDatasets = datasets.map(ds => ({
            ...ds,
            backgroundColor: ds.type === 'bar' ? ds.color || '#42A5F5' : ds.fillColor || 'rgba(66,165,245,0.2)',
            borderColor: ds.color || '#42A5F5',
            borderRadius: ds.type === 'bar' ? 8 : undefined,
            barThickness: ds.type === 'bar' ? 20 : undefined,
            maxBarThickness: ds.type === 'bar' ? 30 : undefined,
            tension: ds.type === 'line' ? 0.4 : undefined,
            fill: ds.type === 'line' ? true : undefined,
            pointRadius: ds.type === 'line' ? 6 : undefined,
            pointHoverRadius: ds.type === 'line' ? 8 : undefined,
            borderWidth: ds.type === 'line' ? 3 : undefined
        }));

        const data = { labels, datasets: preparedDatasets };

        const options = {
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { weight: 600 } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
                x: { ticks: { color: textColor }, grid: { display: false, drawBorder: false } },
                y: { ticks: { color: textColor }, grid: { color: surfaceBorder, drawBorder: false } }
            },
            animation: {
                onComplete: () => {
                    // Apply gradient for bars
                    if (chartRef.current && chartRef.current.chart) {
                        chartRef.current.chart.data.datasets.forEach((ds: any) => {
                            if (ds.type === 'bar') {
                                const ctx = chartRef.current.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, chartRef.current.chart.height);
                                gradient.addColorStop(0, 'rgba(66,165,245,0.8)');
                                gradient.addColorStop(1, 'rgba(66,165,245,0.2)');
                                ds.backgroundColor = gradient;
                            }
                        });
                        chartRef.current.chart.update();
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, [datasets, labels]);

    return (
        <div className="card" style={{ height: '300px' }}>
            <Chart ref={chartRef} type="bar" data={chartData} options={chartOptions} />
        </div>
    );
};

export default Charts;
