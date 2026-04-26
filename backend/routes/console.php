<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('BIZDOM Inbox listo para enviar mensajes claros.');
})->purpose('Muestra un mensaje de inspiracion.');
