// Line Chart
const ctxLine = document.getElementById('lineChart');
new Chart(ctxLine, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Project Growth',
      data: [120, 300, 250, 400, 380, 420, 390, 410, 370, 430, 400, 450],
      borderColor: '#0072ff',
      backgroundColor: 'rgba(0, 114, 255, 0.2)',
      fill: true,
      tension: 0.3
    }]
  },
  options: { responsive: true }
});

// Pie Chart
const ctxPie = document.getElementById('pieChart');
new Chart(ctxPie, {
  type: 'doughnut',
  data: {
    labels: ['Lorem Ipsum', 'Dolor Sit Amet', 'Consectetuer'],
    datasets: [{
      data: [120, 80, 50],
      backgroundColor: ['#ffb347', '#2ecc71', '#0072ff']
    }]
  },
  options: { responsive: true }
});
