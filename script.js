const apiKey = 'e622f31f-c507-4a5c-9bb2-f396df2c62a1'; // Tvůj API klíč
const playerName = 'righterbtw'; // Jméno hráče

async function fetchFaceitData() {
    try {
        // Získání informací o hráči
        const response = await fetch(`https://open.faceit.com/data/v4/players?nickname=${playerName}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const playerId = data.player_id;
        const elo = data.games.csgo.faceit_elo;
        const level = data.games.csgo.skill_level;

        // Nastavení ikony podle levelu hráče
        document.getElementById('level-icon').src = `img/faceit-levels/level${level}.png`;

        // Zobrazení ELO
        document.getElementById('elo').textContent = elo;

        // Načítání poslední historie zápasů pro výpočet ELO změny a dnešních zápasů
        const matchResponse = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=0&limit=20`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const matchData = await matchResponse.json();
        const today = new Date().toISOString().slice(0, 10); // Dnešní datum

        let todayMatches = 0;
        let firstMatchElo = elo;
        let lastMatchElo = elo;

        // Projdeme všechny zápasy
        matchData.items.forEach(match => {
            const matchDate = new Date(match.finished_at * 1000).toISOString().slice(0, 10); // Datum zápasu
            if (matchDate === today) {
                todayMatches += 1;
                firstMatchElo = Math.min(firstMatchElo, match.elo);
                lastMatchElo = Math.max(lastMatchElo, match.elo);
            }
        });

        // Výpočet změny ELO během dne
        const eloChange = elo - firstMatchElo;

        // Aplikace třídy pro barvu podle hodnoty
        const eloChangeElement = document.getElementById('elo-change');
        eloChangeElement.textContent = `${eloChange > 0 ? '+' : ''}${eloChange}`;
        if (eloChange > 0) {
            eloChangeElement.classList.add('positive');
        } else if (eloChange < 0) {
            eloChangeElement.classList.add('negative');
        }

        // Zobrazení počtu dnešních zápasů
        document.getElementById('today-matches').textContent = todayMatches;

    } catch (error) {
        console.error('Error fetching Faceit data:', error);
    }
}

fetchFaceitData();