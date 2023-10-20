## [2.1.1](https://github.com/sesamecare/confit/compare/v2.1.0...v2.1.1) (2023-10-20)


### Bug Fixes

* **formatters:** document and clean up a couple formatters ([d04b57c](https://github.com/sesamecare/confit/commit/d04b57cb669e5dcf2d747d567c6c1cf2012744bb))

# [2.1.0](https://github.com/sesamecare/confit/compare/v2.0.2...v2.1.0) (2023-10-20)


### Features

* **formatters:** add a few more formatters to env and file ([507e61a](https://github.com/sesamecare/confit/commit/507e61aaa8efd36e75ef14f1fa782a3bfc9e1fd8))

## [2.0.2](https://github.com/sesamecare/confit/compare/v2.0.1...v2.0.2) (2023-10-19)


### Bug Fixes

* **env:** add |u to return undefined for an env var that is empty ([10efbd2](https://github.com/sesamecare/confit/commit/10efbd2d378fd06cba6b63533d2c6a0dd3b48ed1))

## [2.0.1](https://github.com/sesamecare/confit/compare/v2.0.0...v2.0.1) (2023-10-18)


### Bug Fixes

* **env:** use APP_ENV instead of NODE_ENV if present ([faba60a](https://github.com/sesamecare/confit/commit/faba60a80db4eebecfc783d7412aa591664bddfd))

# [2.0.0](https://github.com/sesamecare/confit/compare/v1.1.0...v2.0.0) (2023-10-18)


### Bug Fixes

* **lint:** add elvis to optional property access ([f5f3a1b](https://github.com/sesamecare/confit/commit/f5f3a1b540a7bc72261bbb50d99e905bcff63a48))


### Features

* **types:** just expose the config store directly ([9874be5](https://github.com/sesamecare/confit/commit/9874be50a51e353182cfa3fa315a891683152d9c))


### BREAKING CHANGES

* **types:** The base type is now BaseConfitSchema and all
the get/set fanciness is now just get()

# [1.1.0](https://github.com/sesamecare/confit/compare/v1.0.6...v1.1.0) (2023-10-17)


### Features

* **types:** simplify base types ([8197c7f](https://github.com/sesamecare/confit/commit/8197c7f96b33bc314fbe18daed5062ed40417bcc))

## [1.0.6](https://github.com/sesamecare/confit/compare/v1.0.5...v1.0.6) (2023-10-17)


### Bug Fixes

* **yaml:** hide yaml loadoptions type for a simpler version ([3722f7a](https://github.com/sesamecare/confit/commit/3722f7adb339c6ee55255818a84222093cb4ac2e))

## [1.0.5](https://github.com/sesamecare/confit/compare/v1.0.4...v1.0.5) (2023-10-17)


### Bug Fixes

* **yaml:** avoid leaking js-yaml types ([bc46944](https://github.com/sesamecare/confit/commit/bc469448e5d18cf2780f24588e3ef798842351bc))

## [1.0.4](https://github.com/sesamecare/confit/compare/v1.0.3...v1.0.4) (2023-10-17)


### Bug Fixes

* **types:** rework types to better handle optionals ([a767929](https://github.com/sesamecare/confit/commit/a7679297e80b2487864910efbcf0eab4693fd857))

## [1.0.3](https://github.com/sesamecare/confit/compare/v1.0.2...v1.0.3) (2023-10-17)


### Bug Fixes

* **type:** rework config type a bit to force base confit type on config ([9e47b73](https://github.com/sesamecare/confit/commit/9e47b73c08bbb553c3997c089531f44dceab3dc4))

## [1.0.2](https://github.com/sesamecare/confit/compare/v1.0.1...v1.0.2) (2023-10-17)


### Bug Fixes

* **export:** export shortstop handlers ([b0347a6](https://github.com/sesamecare/confit/commit/b0347a65c096ba885c68008ad62a06304d923dee))

## [1.0.1](https://github.com/sesamecare/confit/compare/v1.0.0...v1.0.1) (2023-10-17)


### Bug Fixes

* **types:** export a Confit type ([9c549e3](https://github.com/sesamecare/confit/commit/9c549e3bea91433775c7f4b54c672a22dde18ee3))

# 1.0.0 (2023-10-17)


### Bug Fixes

* **loader:** implement most basic loading methods ([027ded7](https://github.com/sesamecare/confit/commit/027ded71be013b6b39e0a4e55ddfb6375285fe1c))
* **set:** add set method ([46b0050](https://github.com/sesamecare/confit/commit/46b0050e032f6443a10a9a0bb3f64e2b14289f18))
* **shortstop:** bundle more shortstop handlers, add tests, release ([609b9b6](https://github.com/sesamecare/confit/commit/609b9b63cb3c94902bbd93209070a6fa34baf7e8))
* **tests:** add many more tests ([725376b](https://github.com/sesamecare/confit/commit/725376bb9280f832799edfdbe72d2760db76377a))
* **tests:** oh so many tests ([ca2fb35](https://github.com/sesamecare/confit/commit/ca2fb35964861ee7f772bf285fc595a3e4ac8857))
* **token:** update token for publishing ([27a55db](https://github.com/sesamecare/confit/commit/27a55db74ecb347b7a72add2ae3c229eb7f557c3))


### Features

* **get:** typed get works ([6f877b6](https://github.com/sesamecare/confit/commit/6f877b622b5969c3aaee1240f6109369b70982fe))
