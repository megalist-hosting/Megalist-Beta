// js/level.js

async function loadLevelDetails() {

    await init();

    const urlParams = new URLSearchParams(window.location.search);
    const levelId = urlParams.get('id');

    const level = demonListData.find(l => l.rank == levelId);

    if (!level) {
        document.getElementById('level-detail-view').innerHTML =
            "<h1>Nível não encontrado</h1>";
        return;
    }

    const container = document.getElementById('level-detail-view');
    const pontos = calcularPontos(level.rank, 100, 0);

    container.innerHTML = `
        <header class="level-header">
            <h1>${level.name} <a href="/"><i class="fas fa-chevron-right"></i></a></h1>
            <p>published by <strong>${level.publisher}</strong></p>
            <p>verified by <strong>${level.verifier}</strong></p>
        </header>

        <div class="video-container">
            <iframe src="https://www.youtube.com/embed/${level.verification}" frameborder="0" allowfullscreen></iframe>
        </div>

        <section class="level-stats">
            <div class="stat-box">
                <span class="label">Demonlist score (100%)</span>
                <span class="value">${pontos}</span>
            </div>
        </section>

        <section class="records-section">
            <div class="records-header">
                <h3>Records</h3>
                <p>${level.percentToQualify}% required to qualify</p>
            </div>

            <table class="records-table">
                <thead>
                    <tr>
                        <th>Record Holder</th>
                        <th>Progress</th>
                        <th>Video Proof</th>
                    </tr>
                </thead>

                <tbody>
                    ${level.victors.map(v => `
                        <tr>
                            <td class="nick">${v.nick}</td>
                            <td class="progress">${v.percent}</td>
                            <td class="proof">
                                <a href="${v.url}" target="_blank">
                                    YouTube <i class="fas fa-external-link-alt"></i>
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>

            </table>
        </section>
    `;
}

document.addEventListener('DOMContentLoaded', loadLevelDetails);