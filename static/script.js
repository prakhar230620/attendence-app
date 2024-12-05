// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle "Select All" checkbox functionality
    const selectAllCheckbox = document.querySelector('#select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('input[name="attendance"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Set current date as default for attendance
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Form validation for login
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.querySelector('input[name="username"]').value;
            const password = document.querySelector('input[name="password"]').value;

            if (!username || !password) {
                e.preventDefault();
                showAlert('Please fill in all fields', 'danger');
            }
        });
    }

    // Form validation for attendance
    const attendanceForm = document.querySelector('#attendance-form');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', function(e) {
            const checkedBoxes = document.querySelectorAll('input[name="attendance"]:checked');
            if (checkedBoxes.length === 0) {
                e.preventDefault();
                showAlert('Please select at least one student', 'danger');
            }
        });
    }

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.style.display = 'none';
            }, 300);
        }, 5000);
    });

    // Add row highlighting on hover for tables
    const tableRows = document.querySelectorAll('tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
        row.addEventListener('mouseout', function() {
            this.style.backgroundColor = '';
        });
    });
});

// Utility function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

// Handle attendance filter
const filterAttendance = () => {
    const dateFilter = document.querySelector('#date-filter').value;
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach(row => {
        const dateCell = row.querySelector('td:nth-child(3)').textContent;
        if (dateFilter === '' || dateCell === dateFilter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
};

// Export attendance report to CSV
const exportToCSV = () => {
    const table = document.querySelector('table');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td,th');
        const rowData = Array.from(cols).map(col => col.textContent);
        csv.push(rowData.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'attendance_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Add loading indicator
const showLoading = () => {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
};

const hideLoading = () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
};

// Add form input validation
const validateForm = (formElement) => {
    const inputs = formElement.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
};