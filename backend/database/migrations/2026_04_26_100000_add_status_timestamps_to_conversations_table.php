<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'status_received_at')) {
                $table->timestamp('status_received_at')->nullable()->after('status')->index();
            }

            if (! Schema::hasColumn('conversations', 'status_reviewed_at')) {
                $table->timestamp('status_reviewed_at')->nullable()->after('status_received_at')->index();
            }

            if (! Schema::hasColumn('conversations', 'status_in_progress_at')) {
                $table->timestamp('status_in_progress_at')->nullable()->after('status_reviewed_at')->index();
            }

            if (! Schema::hasColumn('conversations', 'status_resolved_at')) {
                $table->timestamp('status_resolved_at')->nullable()->after('status_in_progress_at')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $columns = [];

            foreach (['status_received_at', 'status_reviewed_at', 'status_in_progress_at', 'status_resolved_at'] as $column) {
                if (Schema::hasColumn('conversations', $column)) {
                    $columns[] = $column;
                }
            }

            if (count($columns) > 0) {
                $table->dropColumn($columns);
            }
        });
    }
};
