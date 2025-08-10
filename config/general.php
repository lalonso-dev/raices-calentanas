<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see \craft\config\GeneralConfig
 */

use craft\config\GeneralConfig;
use craft\helpers\App;

$isDev = App::env("CRAFT_ENVIRONMENT") === "dev";
$isProd = App::env("CRAFT_ENVIRONMENT") === "production";

$settings = GeneralConfig::create()
    // Set the default week start day for date pickers (0 = Sunday, 1 = Monday, etc.)
    ->defaultWeekStartDay(1)
    // Prevent generated URLs from including "index.php"
    ->omitScriptNameInUrls()
    // Enable Dev Mode (see https://craftcms.com/guides/what-dev-mode-does)
    ->devMode($isProd ? false : App::env("DEV_MODE") ?? $isDev)
    // Allow administrative changes
    ->allowAdminChanges(App::env("ALLOW_ADMIN_CHANGES") ?? false)
    // Disallow robots
    //->disallowRobots(App::env("DISALLOW_ROBOTS") ?? false)
    ->disallowRobots($isProd ? false : App::env("DISALLOW_ROBOTS") ?? $isDev)
    ->cpTrigger(App::env("CRAFT_CP_TRIGGER") ?? "admin")
    ->limitAutoSlugsToAscii(true)
    ->imageDriver("imagick")
    ->sendPoweredByHeader(false)
    ->maxUploadFileSize("209715200")
    ->defaultTemplateExtensions(["twig"])
    ->brokenImagePath("/assets/img/default.jpg")
    ->transformSvgs(false)
    ->transformGifs(false)
    ->usePathInfo(true)
    ->allowUpdates($isDev)
    ->aliases([
        "@webroot" => dirname(__DIR__) . "/web",
        "@web" => App::env("PRIMARY_SITE_URL"),
    ])
    ->extraFileKinds([
        'svg' => [
            'label' => 'svg',
            'extensions' => ['svg'],
        ],
    ])
    ->errorTemplatePrefix("/errors/");

if ($isDev) {
    $settings->disabledPlugins(["fastcgi-cache-bust"]);
}

if ($isProd) {
    $settings
        ->disabledPlugins([
            "dumper",
            "elements-panel",
            "cp-field-inspect",
            "quick-field",
            "field-manager"
        ])
        ->usePathInfo(true)
        ->omitScriptNameInUrls(true);
}

return $settings;
