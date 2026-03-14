let globalLeaderboard = [];

/**
 * Calcula pontos para uma posição (rank), percent e minPercent (percentToQualify).
 * Retorna valor arredondado para 3 casas decimais (Number).
 */
function calcularPontos(rank, percent, minPercent = 0, multiplier = 1) {

    if (rank > 150) return 0;
    if (rank > 75 && percent < 100) return 0;

    let score =
        (-24.9975 * Math.pow(rank - 1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (percent !== 100) {
        score -= score / 3;
    }

    score *= multiplier;

    return Math.round(score * 1000) / 1000;
}
// a
async function initLeaderboard() {
    const listRes = await fetch("./data/list.json");
    const levelNames = await listRes.json();

    let playersMap = {}; // username -> { user, total, completed: [...] }

    for (let i = 0; i < levelNames.length; i++) {
        const name = levelNames[i];
        const rank = i + 1;

        try {
            const res = await fetch(`./data/${name}.json`);
            const data = await res.json();

            // se percentToQualify for undefined, considere 0 (nullish)
            const qualify = data.percentToQualify ?? 0;

            // pega records (cópia)
            let records = data.records ? [...data.records] : [];

            // adicionar verifier como record 100% (se houver)
            if (data.verifier) {
                records.push({
                    user: data.verifier,
                    percent: 100,
                    verifier: true
                });
            }

            // --- evitar duplicação: por level, escolher o melhor pontos por jogador ---
            // bestPerUser: username -> bestScoreInfo { percent, score, verifier, originalRecord }
            const bestPerUser = {};

            records.forEach(rec => {
                const username = rec.user || rec.player;
                if (!username) return;

                // coerce percent para número
                const recPercent = Number(rec.percent);
                if (Number.isNaN(recPercent)) return;

                // ignorar se abaixo de qualify
                if (recPercent < qualify) return;

                const pontos = calcularPontos(rank, recPercent, qualify);

                const existing = bestPerUser[username];
                // preferir maior pontos (se empate, preferir verifier true)
                if (!existing || pontos > existing.score || (pontos === existing.score && rec.verifier && !existing.verifier)) {
                    bestPerUser[username] = {
                        percent: recPercent,
                        score: pontos,
                        verifier: !!rec.verifier,
                        original: rec
                    };
                }
            });

            // agora somar os melhores de cada jogador deste level ao playersMap
            Object.entries(bestPerUser).forEach(([username, info]) => {
                if (!playersMap[username]) {
                    playersMap[username] = {
                        user: username,
                        total: 0,
                        completed: []
                    };
                }

                // adiciona o score (já arredondado a 3 casas)
                playersMap[username].total += info.score;

                playersMap[username].completed.push({
                    level: data.name || name,
                    rank: rank,
                    score: info.score,
                    percent: info.percent,
                    verifier: info.verifier
                });
            });

        } catch (e) {
            console.error("Erro no nível:", name, e);
        }
    }

    // transformar em array e ordenar
    globalLeaderboard = Object.values(playersMap)
        .sort((a, b) => b.total - a.total);

    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("board-body");
    if (!tbody) return;

    tbody.innerHTML = globalLeaderboard.map((p, i) => `
        <tr onclick="showPlayer(${i})">
            <td>#${i + 1}</td>
            <td>${escapeHtml(p.user)}</td>
            <td>${p.total.toFixed(3)}</td>
        </tr>
    `).join("");
}

function showPlayer(index) {
    const p = globalLeaderboard[index];
    const detailDiv = document.getElementById("player-details");
    if (!detailDiv || !p) return;

    detailDiv.innerHTML = `
        <h2>${escapeHtml(p.user)}</h2>
        <h3>Total: ${p.total.toFixed(3)} pts</h3>

        <table>
        ${p.completed.map(c => `
            <tr>
                <td>#${c.rank}</td>
                <td>${escapeHtml(c.level)}</td>
                <td>${c.percent}%</td>
                <td>${c.verifier ? "✔ Verifier" : ""}</td>
                <td>+${c.score.toFixed(3)}</td>
            </tr>
        `).join("")}
        </table>
    `;
}

// helper mínimo para evitar XSS se nomes vierem de JSON
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", initLeaderboard);