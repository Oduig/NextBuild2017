/* eslint-env mocha */
/* global web3 */
const expect = require('chai').expect
const DQuestions = artifacts.require('DQuestions.sol')

contract('DQuestions', function (accounts) {
  let questions

  beforeEach(async function () {
    questions = await DQuestions.new()
  })

  it('can be constructed', async function () {
    // noinspection BadExpressionStatementJS
    expect(questions).to.exist
  })

  it('has no questions initially', async function () {
    let numberOfQuestions = await questions.numberOfQuestions()
    expect(numberOfQuestions.toNumber()).to.equal(0)
  })

  context('when a question is added', function () {
    const question = 'Who is Santoshi Nakamoto?'
    const answer = 'Knobody knows.'

    beforeEach(async function () {
      await questions.add(question, web3.sha3(answer))
    })

    it('increments the number of questions', async function () {
      let numberOfQuestions = await questions.numberOfQuestions()
      expect(numberOfQuestions.toNumber()).to.equal(1)
    })

    it('retrieves the question', async function () {
      expect(await questions.getQuestion(0)).to.equal(question)
    })

    it('knows about the answer', async function () {
      expect(await questions.getAnswer(0)).to.equal(web3.sha3(answer))
    })

    context('when guessing the right answer', function () {
      let winner = accounts[1]
      let loser = accounts[2]

      beforeEach(async function () {
        await questions.guess(0, answer, { from: winner })
      })

      it('selects the winner', async function () {
        expect(await questions.getWinner(0)).to.equal(winner)
      })

      it('selects a winner only once', async function () {
        await questions.guess(0, answer, { from: loser })
        expect(await questions.getWinner(0)).to.equal(winner)
      })
    })

    context('when guessing a wrong answer', function () {
      beforeEach(async function () {
        await questions.guess(0, 'wrong!')
      })

      it('does not select a winner', async function () {
        const person = await questions.getWinner(0)
        expect(web3.toDecimal(person)).to.equal(0)
      })
    })
  })
})
