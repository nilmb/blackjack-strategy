let cardCount = 0;
let decks = 1;
let playerCount = 1;  // Contador de jugadores
let players = [{ id: 1, cards: [] }];
let handHistory = [];

// Función para manejar el cálculo cuando se pulsa el botón
document.getElementById('calculate-button').addEventListener('click', function() {
  const playerInputs = document.querySelectorAll('.player-cards');
  const dealerCard = document.getElementById('dealer-card').value.trim();
  decks = parseInt(document.getElementById('decks').value) || 1;

  players = Array.from(playerInputs).map((input, index) => ({
    id: index + 1,
    cards: input.value.split(',').map(card => card.trim())
  }));

  updateCardCount(players.flatMap(player => player.cards));
  updateCardCount([dealerCard]);

  const trueCount = (cardCount / decks).toFixed(2);  // Calcular True Count ajustado por barajas
  document.getElementById('card-count').innerText = cardCount;
  document.getElementById('true-count').innerText = trueCount;

  let simulationResults = simulateHands(players, dealerCard);
  updateHistory(simulationResults);
  displaySimulationResults(simulationResults);
  
  const bestMove = calculateBestMove(players[0].cards, dealerCard);
  const successRate = calculateSuccessRate(bestMove, players[0].cards, dealerCard);

  document.getElementById('suggestion').innerText = `Mejor jugada: ${bestMove}`;
  document.getElementById('success-rate').innerText = `Probabilidad de éxito: ${successRate}%`;
});

// Función para reiniciar el contador de cartas
document.getElementById('reset-count').addEventListener('click', function() {
  cardCount = 0;
  document.getElementById('card-count').innerText = cardCount;
  document.getElementById('true-count').innerText = 0;
});

// Función para añadir un nuevo jugador
document.getElementById('add-player-button').addEventListener('click', function() {
  playerCount++;
  const playerContainer = document.getElementById('player-container');
  
  const newPlayerDiv = document.createElement('div');
  newPlayerDiv.className = 'player-entry';
  
  const newPlayerInput = document.createElement('input');
  newPlayerInput.type = 'text';
  newPlayerInput.className = 'player-cards';
  newPlayerInput.placeholder = `Cartas del Jugador ${playerCount}`;
  
  const removeButton = document.createElement('button');
  removeButton.className = 'remove-player-button';
  removeButton.textContent = 'Eliminar';
  removeButton.addEventListener('click', function() {
    newPlayerDiv.remove();
    playerCount--;
    updatePlayerPlaceholders();
    updateRemoveButtonsVisibility();
  });

  newPlayerDiv.appendChild(newPlayerInput);
  newPlayerDiv.appendChild(removeButton);
  playerContainer.appendChild(newPlayerDiv);

  updateRemoveButtonsVisibility();
});

// Función para mostrar/ocultar los botones de eliminación según el número de jugadores
function updateRemoveButtonsVisibility() {
  const removeButtons = document.querySelectorAll('.remove-player-button');
  removeButtons.forEach(button => {
    button.style.display = playerCount > 1 ? 'inline-block' : 'none';
  });
}

// Función para actualizar los placeholders de los jugadores
function updatePlayerPlaceholders() {
  const playerInputs = document.querySelectorAll('.player-cards');
  playerInputs.forEach((input, index) => {
    input.placeholder = `Cartas del Jugador ${index + 1}`;
  });
}

// Función para actualizar el conteo de cartas según las cartas ingresadas
function updateCardCount(cards) {
  cardCount = 0;
  cards.forEach(card => {
    const value = cardValue(card);
    if (value >= 2 && value <= 6) cardCount += 1;  // Cartas bajas +1
    else if (value === 10 || card === 'A') cardCount -= 1;  // Cartas altas -1
    // 7, 8, 9 no cambian el conteo
  });
}

// Simulación de manos para los jugadores y el crupier
function simulateHands(players, dealerCard) {
  const simulations = 10000;  // Número de simulaciones por mano
  let results = players.map(player => ({
    id: player.id,
    wins: 0,
    losses: 0,
    total: simulations
  }));

  for (let i = 0; i < simulations; i++) {
    players.forEach(player => {
      const result = simulateSingleHand(player.cards, dealerCard);
      if (result === 'win') results[player.id - 1].wins++;
      if (result === 'loss') results[player.id - 1].losses++;
    });
  }

  return results;
}

// Simulación de una mano para un solo jugador
function simulateSingleHand(playerCards, dealerCard) {
  const playerTotal = calculateHandValue(playerCards);
  const dealerTotal = simulateDealerHand(dealerCard);

  if (playerTotal > dealerTotal && playerTotal <= 21) return 'win';
  if (playerTotal < dealerTotal || playerTotal > 21) return 'loss';
  return 'tie';
}

// Simulación de la mano del crupier
function simulateDealerHand(dealerCard) {
  let dealerHand = [dealerCard];
  let dealerTotal = calculateHandValue(dealerHand);

  while (dealerTotal < 17) {
    dealerHand.push(drawRandomCard());
    dealerTotal = calculateHandValue(dealerHand);
  }

  return dealerTotal;
}

// Función para obtener una carta aleatoria
function drawRandomCard() {
  const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
}

// Función para actualizar el historial de simulaciones
function updateHistory(simulationResults) {
  const historyList = document.getElementById('hand-history');
  const listItem = document.createElement('li');
  const result = simulationResults[0];  // Jugador 1 por defecto
  const successRate = ((result.wins / result.total) * 100).toFixed(2);
  listItem.textContent = `Simulación: ${result.wins} victorias, ${result.losses} derrotas (Jugador 1), Éxito: ${successRate}%`;
  historyList.appendChild(listItem);
}

// Función para mostrar los resultados de las simulaciones
function displaySimulationResults(simulationResults) {
  const resultsTable = document.getElementById('simulation-results').querySelector('tbody');
  resultsTable.innerHTML = '';

  simulationResults.forEach(result => {
    const successRate = ((result.wins / result.total) * 100).toFixed(2);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Jugador ${result.id}</td>
      <td>${result.wins}</td>
      <td>${result.losses}</td>
      <td>${result.total}</td>
      <td>${successRate}%</td>
    `;
    resultsTable.appendChild(row);
  });
}

// Funciones para calcular las mejores jugadas y demás...
function calculateBestMove(playerCards, dealerCard) {
  const playerTotal = calculateHandValue(playerCards);
  const dealerValue = cardValue(dealerCard);
  const trueCount = cardCount / decks;

  if (playerCards.length === 2 && playerCards[0] === playerCards[1]) {
    return calculateSplitMove(playerCards[0], dealerValue);
  }

  if (playerCards.includes('A') && playerTotal <= 21) {
    return calculateSoftMove(playerTotal, dealerValue, trueCount);
  }

  return calculateHardMove(playerTotal, dealerValue, trueCount);
}

function calculateSuccessRate(move, playerCards, dealerCard) {
  const playerTotal = calculateHandValue(playerCards);
  const dealerValue = cardValue(dealerCard);
  const trueCount = cardCount / decks;

  switch (move) {
    case 'Plantarse':
      if (playerTotal >= 17) return 80;
      return 60;
    case 'Pedir carta':
      if (playerTotal <= 11) return 85;
      return trueCount > 1 ? 75 : 55;
    case 'Doblar':
      return trueCount > 1 ? 70 : 50;
    case 'Dividir':
      return 70;
    default:
      return 50;
  }
}

// Funciones para calcular el valor de las cartas
function calculateHandValue(cards) {
  let total = 0;
  let aces = 0;

  cards.forEach(card => {
    const value = cardValue(card);
    total += value;
    if (card === 'A') aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function cardValue(card) {
  if (card === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card)) return 10;
  return parseInt(card);
}

// Funciones para manejar movimientos duros, suaves y divisiones
function calculateHardMove(playerTotal, dealerValue, trueCount) {
  if (playerTotal >= 17) return 'Plantarse';
  if (playerTotal >= 13 && dealerValue <= 6) return trueCount >= 1 ? 'Doblar' : 'Plantarse';
  if (playerTotal === 12 && dealerValue >= 4 && dealerValue <= 6) return 'Plantarse';
  if (playerTotal <= 11) return trueCount >= 1 ? 'Doblar' : 'Pedir carta';
  return 'Pedir carta';
}

function calculateSoftMove(playerTotal, dealerValue, trueCount) {
  if (playerTotal >= 19) return 'Plantarse';
  if (playerTotal === 18 && dealerValue >= 9) return trueCount >= 2 ? 'Doblar' : 'Pedir carta';
  return 'Doblar si es posible, de lo contrario, Plantarse';
}

function calculateSplitMove(card, dealerValue) {
  if (card === 'A' || card === '8') return 'Dividir';
  if (card === '2' || card === '3' && dealerValue >= 4 && dealerValue <= 7) return 'Dividir';
  if (card === '6' && dealerValue >= 3 && dealerValue <= 6) return 'Dividir';
  return 'No dividir';
}
