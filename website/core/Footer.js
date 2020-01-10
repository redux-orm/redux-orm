/**
 * Copyright (c) 2020, Redux-ORM
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const docUrl = (doc, baseUrl) => `${baseUrl}${doc}`;

const Footer = props => (
    <footer className="nav-footer" id="footer">
        <section className="sitemap">
            <a href={props.config.baseUrl} className="nav-home">
                {props.config.footerIcon && (
                    <img
                        src={props.config.baseUrl + props.config.footerIcon}
                        alt={props.config.title}
                        width="66"
                        height="58"
                    />
                )}
            </a>
            <div>
                <h5>Docs</h5>
                <a
                    href={docUrl(
                        'introduction/getting-started',
                        props.config.baseUrl
                    )}
                >
                    Getting Started
                </a>
                {/* <a href={docUrl("introduction/core-concepts", props.config.baseUrl)}>
          Core Concepts
        </a> */}
                <a href={docUrl('basics/quick-start', props.config.baseUrl)}>
                    Quick Start
                </a>
                <a
                    href={docUrl(
                        'advanced/complex-selectors',
                        props.config.baseUrl
                    )}
                >
                    Advanced scenarios
                </a>
            </div>
            <div>
                <h5>Community</h5>
                <a
                    href="https://stackoverflow.com/questions/tagged/redux-orm"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    Stack Overflow
                </a>
                <a
                    href="https://gitter.im/redux-orm/Lobby"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    Gitter
                </a>
            </div>
            <div>
                <h5>More</h5>
                <a href="https://github.com/redux-orm/redux-orm/">GitHub</a>
                <a
                    className="github-button"
                    href={props.config.repoUrl}
                    data-icon="octicon-star"
                    data-count-href="/redux-orm/redux-orm/stargazers"
                    data-show-count="true"
                    data-count-aria-label="# stargazers on GitHub"
                    aria-label="Star this project on GitHub"
                >
                    Star
                </a>
            </div>
        </section>
        <section className="copyright">
            {props.config.copyright}
            <br />
            Some icons copyright{' '}
            <a
                href="https://fontawesome.com/license/free"
                style={{ color: 'white' }}
            >
                Font Awesome.
            </a>
        </section>
    </footer>
);

module.exports = Footer;
