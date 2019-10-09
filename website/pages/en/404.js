/**
 * Copyright (c) 2017-present, Redux-ORM.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const getTrackingScript = () => {
    if (!siteConfig.gaTrackingId) {
        return null;
    }

    return {
        __html: `
      ga('create', "${siteConfig.gaTrackingId}");
      ga('send', {
        hitType: 'event',
        eventCategory: '404 Response',
        eventAction: window.location.href,
        eventLabel: document.referrer
      });`,
    };
};

const errorPage = () => (
    <div className="error-page">
        {getTrackingScript() && (
            <script dangerouslySetInnerHTML={getTrackingScript()} />
        )}
        <div className="error-message">
            <div className=" error-message-container container">
                <span>404 </span>
                <p>Page Not Found.</p>
                <a href="/">Return to the front page</a>
            </div>
        </div>
    </div>
);

errorPage.title = 'Page Not Found';

module.exports = errorPage;
