// Analytics Page Logic

let analyticsLineChart = null;
let analyticsPieChart = null;

document.addEventListener('DOMContentLoaded', () => {
  redirectIfNotRole('organizer');
  setupAnalyticsPage();
  updateNavigation();
});

const setupAnalyticsPage = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    // Load specific event analytics
    await loadEventAnalytics(eventId);
  } else {
    // Load organizer dashboard analytics
    await loadOrganizerAnalytics();
  }
};

const loadEventAnalytics = async (eventId) => {
  try {
    const response = await analyticsAPI.getEventAnalytics(eventId);
    const analytics = response.analytics;
    const eventTitle = new URLSearchParams(window.location.search).get('eventTitle');

    displayEventAnalytics(analytics, eventTitle);
  } catch (error) {
    alert('Error loading analytics: ' + error.message);
  }
};

const displayEventAnalytics = (analytics, eventTitle) => {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  const { totalRegistrations, registrationsPerDay, approvalStats, totalRevenue, pendingRevenue } =
    analytics;

  container.innerHTML = `
    <h2>Analytics - ${eventTitle || 'Event'}</h2>
    
    <div class="analytics-summary">
      <div class="summary-card">
        <h4>Total Registrations</h4>
        <p class="big-number">${totalRegistrations}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Revenue</h4>
        <p class="big-number">₹${totalRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Revenue</h4>
        <p class="big-number">₹${pendingRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Approved</h4>
        <p class="big-number">${approvalStats.approved}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Approval</h4>
        <p class="big-number">${approvalStats.pending}</p>
      </div>
      
      <div class="summary-card">
        <h4>Rejected</h4>
        <p class="big-number">${approvalStats.rejected}</p>
      </div>
    </div>
    
    <div class="charts-container">
      <div class="chart-wrapper">
        <canvas id="lineChart"></canvas>
      </div>
      
      <div class="chart-wrapper">
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  `;

  // Draw charts
  drawLineChart(registrationsPerDay);
  drawPieChart(approvalStats);
};

const loadOrganizerAnalytics = async () => {
  try {
    const response = await analyticsAPI.getOrganizerDashboardAnalytics();
    const { summary, events } = response;

    displayOrganizerAnalytics(summary, events);
  } catch (error) {
    alert('Error loading analytics: ' + error.message);
  }
};

const displayOrganizerAnalytics = (summary, events) => {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  container.innerHTML = `
    <h2>Dashboard Analytics</h2>
    
    <div class="analytics-summary">
      <div class="summary-card">
        <h4>Total Events</h4>
        <p class="big-number">${summary.totalEvents}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Registrations</h4>
        <p class="big-number">${summary.totalRegistrations}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Revenue</h4>
        <p class="big-number">₹${summary.totalRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Revenue</h4>
        <p class="big-number">₹${summary.pendingRevenue}</p>
      </div>
    </div>
    
    <div class="events-analytics">
      <h3>Event-wise Analytics</h3>
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Registrations</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Revenue</th>
            <th>Pending Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${events
            .map(
              (event) => `
            <tr>
              <td>${event.title}</td>
              <td>${event.totalRegistrations}</td>
              <td>${event.approvalStats.approved}</td>
              <td>${event.approvalStats.rejected}</td>
              <td>₹${event.totalRevenue}</td>
              <td>₹${event.pendingRevenue}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
};

const drawLineChart = (registrationsPerDay) => {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  const dates = Object.keys(registrationsPerDay).sort();
  const data = dates.map((date) => registrationsPerDay[date]);

  if (analyticsLineChart) {
    analyticsLineChart.destroy();
  }

  analyticsLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Registrations per Day',
          data: data,
          borderColor: '#0f766e',
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return 'rgba(15, 118, 110, 0.18)';
            }

            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(15, 118, 110, 0.32)');
            gradient.addColorStop(1, 'rgba(15, 118, 110, 0.02)');
            return gradient;
          },
          borderWidth: 3,
          tension: 0.42,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fbf7f0',
          pointBorderColor: '#0f766e',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#0f766e',
          pointHoverBorderColor: '#1d3557',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1d3557',
            font: {
              size: 12,
              weight: '600',
            },
            boxWidth: 14,
          },
        },
        title: {
          display: true,
          text: 'Registrations Over Time',
          color: '#1d3557',
          font: {
            size: 16,
            weight: '700',
          },
          padding: {
            bottom: 14,
          },
        },
        tooltip: {
          backgroundColor: '#1d3557',
          titleColor: '#ffffff',
          bodyColor: '#e5ecf4',
          borderColor: 'rgba(15, 118, 110, 0.4)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          cornerRadius: 2,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#607086',
            maxRotation: 0,
            autoSkip: true,
          },
          border: {
            color: 'rgba(29, 53, 87, 0.14)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#607086',
            precision: 0,
            stepSize: 1,
          },
          grid: {
            color: 'rgba(29, 53, 87, 0.08)',
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
    },
  });
};

const drawPieChart = (approvalStats) => {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;

  if (analyticsPieChart) {
    analyticsPieChart.destroy();
  }

  analyticsPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        {
          data: [
            approvalStats.approved,
            approvalStats.rejected,
            approvalStats.pending,
          ],
          backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
          borderColor: ['#27ae60', '#c0392b', '#d68910'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 8,
          right: 18,
          bottom: 8,
          left: 18,
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1d3557',
            font: {
              size: 12,
              weight: '600',
            },
            boxWidth: 12,
            padding: 12,
          },
        },
        title: {
          display: true,
          text: 'Registration Approval Status',
          color: '#1d3557',
          font: {
            size: 16,
            weight: '700',
          },
          padding: {
            bottom: 12,
          },
        },
      },
      radius: '78%',
    },
  });
};
