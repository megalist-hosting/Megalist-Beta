
const staffData = {
    editors: ["MEGA 👑"],
    helpers: ["-- NO ONE --"]
};

function calcularPontos(posicao, porcentagem, minPercent = 0) {

    if (posicao > 150) return 0;
    if (posicao > 75 && porcentagem < 100) return 0;

    let score =
        (-24.9975 * Math.pow(posicao - 1, 0.4) + 200) *
        ((porcentagem - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (porcentagem !== 100) {
        score = score - score / 3;
    }

    return Number(score.toFixed(2));
}

function renderDemons() {
    const listContainer = document.getElementById('demon-list');
    if (!listContainer) return;

    listContainer.innerHTML = demonListData.map(level => {
        const pontosAtuais = calcularPontos(level.rank,100,0);

        return `
        <a href="/level.html?id=${level.rank}" class="card-link" style="text-decoration: none; color: inherit;">
            <article class="card">
                <img src="https://i.ytimg.com/vi/${level.thumbnail}/hqdefault.jpg" alt="${level.name}">
                <div class="card-info">
                    <h2>#${level.rank} – ${level.name}</h2>
                    <p> by ${level.publisher}</p>
                    <div class="level-points">
                        <strong>${pontosAtuais}</strong> points
                    </div>
                </div>
            </article>
        </a>
        `;
    }).join('');
}

function renderStaff() {
    const editorsDiv = document.getElementById('editors-list');
    const helpersDiv = document.getElementById('helpers-list');

    if(editorsDiv) editorsDiv.innerHTML = staffData.editors.join('<br>');
    if(helpersDiv) helpersDiv.innerHTML = staffData.helpers.join('<br>');
}

function getYoutubeID(url) {
    if (!url) return "";
    // Este regex cobre: links normais, shorts, youtu.be e links com query strings
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : "";
}

async function init() {
    try {

        const response = await fetch("./data/list.json");

        if (!response.ok) {
            throw new Error("Arquivo _list.json não encontrado");
        }

        const levelNames = await response.json();

        const levels = await Promise.all(
            levelNames.map(async (name, index) => {

                const res = await fetch(`./data/${name}.json`);

                if (!res.ok) {
                    throw new Error(`Arquivo ${name}.json não encontrado`);
                }

                const data = await res.json();

                return {
                    rank: index + 1,
                    name: data.name,
                    publisher: data.author,
                    thumbnail: getYoutubeID(data.verification),
                    raw: data
                };

            })
        );

        demonListData = levels;

        renderDemons();
        renderStaff();

    } catch (error) {
        console.error("Erro crítico:", error);
        document.getElementById('demon-list').innerHTML = "<p>Erro ao carregar a lista.</p>";
    }
}
document.addEventListener('DOMContentLoaded', init);