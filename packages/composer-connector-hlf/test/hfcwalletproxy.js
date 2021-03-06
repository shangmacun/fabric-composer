/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const HFCWalletProxy = require('../lib/hfcwalletproxy');
const Wallet = require('composer-common').Wallet;

require('chai').should();
const sinon = require('sinon');
require('sinon-as-promised');

describe('HFCWalletProxy', () => {

    let mockWallet;
    let walletProxy;

    beforeEach(() => {
        mockWallet = sinon.createStubInstance(Wallet);
        walletProxy = new HFCWalletProxy(mockWallet);
    });

    describe('#getValue', () => {

        it('should pass back the value from the wallet', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(true);
            mockWallet.get.withArgs('member.bob1').resolves('hello world');
            let cb = sinon.stub();
            return walletProxy.getValue('member.bob1', cb)
                .then(() => {
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb, null, 'hello world');
                });
        });

        it('should pass back null if it does not exist in the wallet', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(false);
            let cb = sinon.stub();
            return walletProxy.getValue('member.bob1', cb)
                .then(() => {
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb, null, null);
                });
        });

        it('should pass back any errors from the wallet', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(true);
            mockWallet.get.withArgs('member.bob1').rejects('ENOPERM');
            let cb = sinon.stub();
            return walletProxy.getValue('member.bob1', cb)
                .then(() => {
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb, sinon.match.has('message', sinon.match(/ENOPERM/)));
                });
        });

    });

    describe('#setValue', () => {

        it('should add the value to the wallet and call the callback', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(false);
            let cb = sinon.stub();
            return walletProxy.setValue('member.bob1', 'hello world', cb)
                .then(() => {
                    sinon.assert.calledOnce(mockWallet.add);
                    sinon.assert.calledWith(mockWallet.add, 'member.bob1', 'hello world');
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb);
                });
        });

        it('should update the value in the wallet and call the callback', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(true);
            let cb = sinon.stub();
            return walletProxy.setValue('member.bob1', 'hello world', cb)
                .then(() => {
                    sinon.assert.calledOnce(mockWallet.update);
                    sinon.assert.calledWith(mockWallet.update, 'member.bob1', 'hello world');
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb);
                });
        });

        it('should pass back any errors from the wallet', () => {
            mockWallet.contains.withArgs('member.bob1').resolves(true);
            mockWallet.update.withArgs('member.bob1').rejects('ENOPERM');
            let cb = sinon.stub();
            return walletProxy.setValue('member.bob1', 'hello world', cb)
                .then(() => {
                    sinon.assert.calledOnce(cb);
                    sinon.assert.calledWith(cb, sinon.match.has('message', sinon.match(/ENOPERM/)));
                });
        });

    });

});
