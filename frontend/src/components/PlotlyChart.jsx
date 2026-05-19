import Plot from 'react-plotly.js'

const BASE_LAYOUT = {
  font: { family: 'Inter, system-ui, sans-serif', size: 12, color: '#1A1A2E' },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  margin: { t: 10, r: 16, b: 48, l: 48 },
  xaxis: { gridcolor: '#F0F4F8', zeroline: false, tickfont: { size: 11 } },
  yaxis: { gridcolor: '#F0F4F8', zeroline: false, tickfont: { size: 11 } },
  showlegend: false,
}

export default function PlotlyChart({ data, layout = {}, height = 260 }) {
  return (
    <Plot
      data={data}
      layout={{ ...BASE_LAYOUT, height, ...layout }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}
