// js/data.js

let demonListData = [];

async function init() {

    if (demonListData.length > 0) return;

    try {

        const listResponse = await fetch("data/_list.json");
        if (!listResponse.ok) throw new Error("Erro ao carregar _list.json");

        const levelNames = await listResponse.json();

        const levels = await Promise.all(
            levelNames.map(async (name, index) => {

                const res = await fetch(`data/${name}.json`);
                if (!res.ok) throw new Error(`Erro ao carregar ${name}.json`);

                const data = await res.json();

                return {
                    rank: index + 1,
                    name: data.name,
                    verifier: data.verifier,
                    publisher: data.author,
                    verification: getYoutubeID(data.verification),
                    percentToQualify: data.percentToQualify,
                    victors: data.records.map(r => ({
                        nick: r.user,
                        url: r.link,
                        percent: r.percent
                    }))
                };

            })
        );

        demonListData = levels;

    } catch (error) {

        console.error("Erro crítico:", error);

    }
}

function getYoutubeID(url) {

    const match = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
    return match ? match[1] : "";

}

function calcularPontos(posicao) {

    const pontosTopo = 350;
    const diferenca = 18.29;

    const resultado = pontosTopo - (posicao - 1) * diferenca;

    return +(Math.max(0, resultado)).toFixed(2);

}