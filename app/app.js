let allTenants = []; // Store all tenants for filtering

ZOHO.embeddedApp.on("PageLoad", function (data) {
    ZOHO.CRM.API.getRelatedRecords({
        Entity: data.Entity,
        RecordID: data.EntityId[0],
        RelatedList:"Clients",
        page: 1,
        per_page: 200
    })
        .then(function (tenants) {
            console.log(tenants);
            allTenants = tenants.data;
            renderTenantsList(tenants.data);
        })
        .catch(function (error) {
            console.log("Error fetching occupants: ", error)
        })
});

function renderTenantsList(tenants) {
    const tenantsHTML = tenants.map((tenant, index) => `
        <div class="tenant-card">
            <div class="tenant-header">
                <div class="tenant-profile">
                    <div class="avatar">
                        ${tenant.Contact_Name?.name.charAt(0)}
                    </div>
                    <div class="tenant-basic-info">
                        <h2>${tenant.Contact_Name?.name}</h2>
                        <p><i class="fas fa-phone"></i> ${tenant.Phone || 'No phone'}</p>
                    </div>
                </div>
                <button class="expand-btn" onclick="toggleTenantDetails(this)">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>

            <div class="tenant-details hidden">
                <div class="tabs">
                    ${tenant.Type === 'Buying' ? `
                        <button class="tab-btn active" onclick="switchTab(this, 'purchase-${index}')">Purchase Details</button>
                    ` : `
                        <button class="tab-btn active" onclick="switchTab(this, 'lease-${index}')">Lease Details</button>
                    `}
                    <button class="tab-btn" onclick="switchTab(this, 'financial-${index}')">Financial Info</button>
                    <button class="tab-btn" onclick="switchTab(this, 'property-${index}')">Property Details</button>
                </div>

                ${tenant.Type === 'Buying' ? `
                    <div id="purchase-${index}" class="tab-content active">
                        <table class="info-table">
                            <tr>
                                <th>Status</th>
                                <td>${tenant.Stage}</td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>${tenant.Type}</td>
                            </tr>
                            <tr>
                                <th>Amount</th>
                                <td>${tenant.$currency_symbol} ${tenant.Amount || 0}</td>
                            </tr>
                            <tr>
                                <th>Probability</th>
                                <td>${tenant.Probability}%</td>
                            </tr>
                        </table>
                    </div>
                ` : `
                    <div id="lease-${index}" class="tab-content active">
                        <table class="info-table">
                            <tr>
                                <th>Start Date</th>
                                <td>${tenant.Lease_Start_Date ? formatDate(tenant.Lease_Start_Date) : 'Not set'}</td>
                            </tr>
                            <tr>
                                <th>End Date</th>
                                <td>${tenant.Lease_End_Date ? formatDate(tenant.Lease_End_Date) : 'Not set'}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>${tenant.Stage}</td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>${tenant.Type}</td>
                            </tr>
                        </table>
                    </div>
                `}

                <div id="financial-${index}" class="tab-content">
                    <table class="info-table">
                        ${tenant.Type === 'Buying' ? `
                            <tr>
                                <th>Price</th>
                                <td>${tenant.$currency_symbol} ${tenant.Price || 0}</td>
                            </tr>
                            <tr>
                                <th>Service Charge</th>
                                <td>${tenant.$currency_symbol} ${tenant.Service_Charge || 0}</td>
                            </tr>
                            <tr>
                                <th>Payment Type</th>
                                <td>${tenant.Payment_Type || 'Not specified'}</td>
                            </tr>
                        ` : `
                            <tr>
                                <th>Rent</th>
                                <td>${tenant.$currency_symbol} ${tenant.Rent || 0}</td>
                            </tr>
                            <tr>
                                <th>Service Charge</th>
                                <td>${tenant.$currency_symbol} ${tenant.Service_Charge || 0}</td>
                            </tr>
                            <tr>
                                <th>Total Monthly</th>
                                <td>${tenant.$currency_symbol} ${(tenant.Rent || 0) + (tenant.Service_Charge || 0)}</td>
                            </tr>
                            <tr>
                                <th>Payment Type</th>
                                <td>${tenant.Payment_Type || 'Not specified'}</td>
                            </tr>
                        `}
                    </table>
                </div>

                <div id="property-${index}" class="tab-content">
                    <table class="info-table">
                        <tr>
                            <th>Building</th>
                            <td>${tenant.Building_Apartment.name}</td>
                        </tr>
                        <tr>
                            <th>Unit</th>
                            <td>${tenant.Unit_Name?.name}</td>
                        </tr>
                        <tr>
                            <th>Owner</th>
                            <td>${tenant.Owner.name}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('tenant-widget').innerHTML = tenantsHTML;
}

function switchTab(button, tabId) {
    // Get all tabs and contents in this tenant card
    const tenantCard = button.closest('.tenant-card');
    const tabs = tenantCard.querySelectorAll('.tab-btn');
    const contents = tenantCard.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and contents
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    button.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function toggleTenantDetails(button) {
    const detailsSection = button.closest('.tenant-card').querySelector('.tenant-details');
    const icon = button.querySelector('i');
    
    detailsSection.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function searchTenants() {
    const searchTerm = document.getElementById('tenant-search').value.toLowerCase();
    const filteredTenants = allTenants.filter(tenant => {
        return (
            (tenant.Contact_Name?.name || '').toLowerCase().includes(searchTerm) ||
            (tenant.Phone || '').toLowerCase().includes(searchTerm) ||
            (tenant.Building_Apartment?.name || '').toLowerCase().includes(searchTerm) ||
            (tenant.Unit_Name?.name || '').toLowerCase().includes(searchTerm)
        );
    });
    renderTenantsList(filteredTenants);
}

ZOHO.embeddedApp.init();
