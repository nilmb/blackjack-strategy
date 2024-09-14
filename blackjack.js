(function() {
  const hit = "Pedir";
  const stay = "Quedarse";
  const double = "Doblar";
  const split = "Separar";
  const splitOrHit = "Separar si se permite doblar después, si no Pedir";
  const splitOrDouble = "Separar si se permite doblar después, si no Doblar";
  const surrenderOrHit = "Rendirse si está permitido, si no Pedir";
  
  window.getBlackjackAction = function() {
    const playerHand = document.getElementById('player-hand').value.split(',').map(Number);
    const dealerCard = parseInt(document.getElementById('dealer-card').value);
    let action = '';

    const handTotal = calculateHandTotal(playerHand);
    const isSoft = isSoftHand(playerHand);

    if (isSoft && handTotal <= 21) {
      action = checkSoftHands(playerHand, dealerCard);
    } else if (playerHand.length === 2 && playerHand[0] === playerHand[1]) {
      action = checkPairs(playerHand[0], dealerCard);
    } else {
      action = checkHardHands(handTotal, dealerCard);
    }

    document.getElementById('result').textContent = `Acción recomendada: ${action}`;
  };

  function calculateHandTotal(hand) {
    let total = hand.reduce((sum, card) => sum + card, 0);
    let aces = hand.filter(card => card === 1).length;

    while (aces > 0 && total + 10 <= 21) {
      total += 10;
      aces--;
    }

    return total;
  }

  function isSoftHand(hand) {
    const total = hand.reduce((sum, card) => sum + card, 0);
    return hand.includes(1) && total + 10 <= 21;
  }

  function checkSoftHands(playerHand, dealerCard) {
    const softStrategy = {
      'A,2': { 2: hit, 3: hit, 4: hit, 5: hit, 6: hit, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      'A,3': { 2: hit, 3: hit, 4: hit, 5: hit, 6: hit, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      'A,4': { 2: hit, 3: hit, 4: hit, 5: hit, 6: hit, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      'A,5': { 2: hit, 3: hit, 4: hit, 5: hit, 6: hit, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      'A,6': { 2: hit, 3: hit, 4: hit, 5: hit, 6: hit, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      'A,7': { 2: stay, 3: stay, 4: stay, 5: double, 6: double, 7: stay, 8: stay, 9: stay, 10: stay, 11: stay },
      'A,8': { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: stay, 8: stay, 9: stay, 10: stay, 11: stay },
      'A,9': { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: stay, 8: stay, 9: stay, 10: stay, 11: stay }
    };

    const cardWithoutAce = Math.max(...playerHand.filter(n => n !== 1));
    const softTotal = `A,${cardWithoutAce}`;
    
    return softStrategy[softTotal]?.[dealerCard] || hit;
  }

  function checkPairs(pairCard, dealerCard) {
    const pairsStrategy = {
      2: { 2: splitOrHit, 3: splitOrHit, 4: split, 5: split, 6: split, 7: split, 8: splitOrHit, 9: hit, 10: stay, 11: split },
      3: { 2: splitOrHit, 3: splitOrHit, 4: split, 5: split, 6: split, 7: split, 8: splitOrHit, 9: hit, 10: stay, 11: split },
      4: { 2: split, 3: split, 4: split, 5: split, 6: split, 7: split, 8: split, 9: split, 10: stay, 11: split },
      5: { 2: double, 3: double, 4: double, 5: double, 6: double, 7: hit, 8: hit, 9: hit, 10: stay, 11: stay },
      6: { 2: splitOrHit, 3: splitOrHit, 4: split, 5: split, 6: split, 7: split, 8: hit, 9: hit, 10: stay, 11: split },
      7: { 2: split, 3: split, 4: split, 5: split, 6: split, 7: split, 8: hit, 9: hit, 10: stay, 11: split },
      8: { 2: splitOrDouble, 3: splitOrDouble, 4: splitOrDouble, 5: splitOrDouble, 6: splitOrDouble, 7: splitOrDouble, 8: hit, 9: hit, 10: stay, 11: split },
      9: { 2: splitOrDouble, 3: splitOrDouble, 4: splitOrDouble, 5: splitOrDouble, 6: splitOrDouble, 7: splitOrDouble, 8: hit, 9: hit, 10: stay, 11: split },
      10: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: stay, 8: stay, 9: stay, 10: stay, 11: stay },
      11: { 2: split, 3: split, 4: split, 5: split, 6: split, 7: split, 8: split, 9: split, 10: stay, 11: split }
    };

    return pairsStrategy[pairCard][dealerCard];
  }

  function checkHardHands(total, dealerCard) {
    const hardStrategy = {
      12: { 2: hit, 3: hit, 4: stay, 5: stay, 6: stay, 7: hit, 8: hit, 9: hit, 10: hit, 11: hit },
      13: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: hit, 8: hit, 9: hit, 10: hit, 11: hit },
      14: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: hit, 8: hit, 9: hit, 10: hit, 11: hit },
      15: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: hit, 8: hit, 9: hit, 10: hit, 11: hit },
      16: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: hit, 8: hit, 9: hit, 10: hit, 11: hit },
      17: { 2: stay, 3: stay, 4: stay, 5: stay, 6: stay, 7: stay, 8: stay, 9: stay, 10: stay, 11: stay }
    };

    return hardStrategy[total]?.[dealerCard] || hit;
  }
})();
